import AVFoundation
import Capacitor
import CoreImage
import UIKit

@objc(NativeVideoEncoderPlugin)
public class NativeVideoEncoderPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeVideoEncoderPlugin"
    public let jsName = "NativeVideoEncoder"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "addFrame", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "finish", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancel", returnType: CAPPluginReturnPromise)
    ]

    private var writer: AVAssetWriter?
    private var input: AVAssetWriterInput?
    private var adaptor: AVAssetWriterInputPixelBufferAdaptor?
    private var outputURL: URL?
    private var fps: Int32 = 60
    private var width = 0
    private var height = 0
    private let imageContext = CIContext(options: [.cacheIntermediates: false])
    private let encodeQueue = DispatchQueue(label: "app.mineskin.video-encoder")

    @objc func start(_ call: CAPPluginCall) {
        encodeQueue.async {
            do {
                self.cleanUp()
                self.width = call.getInt("width") ?? 1080
                self.height = call.getInt("height") ?? 1920
                self.fps = Int32(call.getInt("fps") ?? 60)
                let bitrate = call.getInt("bitrate") ?? 8_000_000
                let url = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString + ".mp4")
                let writer = try AVAssetWriter(outputURL: url, fileType: .mp4)
                // Put the MP4's metadata before its media bytes so WKWebView can
                // begin the preview without first scanning the whole Blob.
                writer.shouldOptimizeForNetworkUse = true
                let settings: [String: Any] = [
                    AVVideoCodecKey: AVVideoCodecType.h264,
                    AVVideoWidthKey: self.width,
                    AVVideoHeightKey: self.height,
                    AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: bitrate]
                ]
                let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
                input.expectsMediaDataInRealTime = false
                guard writer.canAdd(input) else { throw EncoderError.unavailable }
                writer.add(input)
                let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
                    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
                    kCVPixelBufferWidthKey as String: self.width,
                    kCVPixelBufferHeightKey as String: self.height
                ])
                guard writer.startWriting() else { throw writer.error ?? EncoderError.unavailable }
                writer.startSession(atSourceTime: .zero)
                self.writer = writer; self.input = input; self.adaptor = adaptor; self.outputURL = url
                call.resolve()
            } catch { call.reject("Could not start native video encoder", nil, error) }
        }
    }

    @objc func addFrame(_ call: CAPPluginCall) {
        encodeQueue.async {
            guard let jpeg = call.getString("jpeg"), let data = Data(base64Encoded: jpeg),
                  let image = CIImage(data: data, options: [.applyOrientationProperty: true]),
                  let input = self.input,
                  let adaptor = self.adaptor,
                  let pool = adaptor.pixelBufferPool else {
                call.reject("Could not decode or accept video frame"); return
            }
            while !input.isReadyForMoreMediaData {
                if self.writer?.status == .failed {
                    call.reject("Native video encoder failed", nil, self.writer?.error); return
                }
                Thread.sleep(forTimeInterval: 0.002)
            }
            var buffer: CVPixelBuffer?
            guard CVPixelBufferPoolCreatePixelBuffer(nil, pool, &buffer) == kCVReturnSuccess,
                  let pixelBuffer = buffer else { call.reject("Could not allocate video frame"); return }
            // Core Image renders directly into the video buffer using its
            // native coordinate system. This avoids the manual CGContext flip
            // that produced mirrored/rotated frames in iOS-on-Mac WebViews.
            self.imageContext.render(
                image,
                to: pixelBuffer,
                bounds: CGRect(x: 0, y: 0, width: self.width, height: self.height),
                colorSpace: CGColorSpaceCreateDeviceRGB()
            )
            let time = CMTime(value: Int64(call.getInt("frameIndex") ?? 0), timescale: self.fps)
            adaptor.append(pixelBuffer, withPresentationTime: time) ? call.resolve() : call.reject("Could not append video frame")
        }
    }

    @objc func finish(_ call: CAPPluginCall) {
        encodeQueue.async {
            guard let writer = self.writer, let input = self.input, let url = self.outputURL else {
                call.reject("Native video encoder was not started"); return
            }
            input.markAsFinished()
            writer.finishWriting {
                do {
                    guard writer.status == .completed else { throw writer.error ?? EncoderError.unavailable }
                    let base64 = try Data(contentsOf: url).base64EncodedString()
                    // Keep the temporary MP4 available for the preview player.
                    // It is removed by the next recording (or app cache cleanup).
                    self.writer = nil; self.input = nil; self.adaptor = nil
                    call.resolve(["base64": base64, "uri": url.absoluteString])
                } catch { self.cleanUp(); call.reject("Could not finish native video", nil, error) }
            }
        }
    }

    @objc func cancel(_ call: CAPPluginCall) {
        encodeQueue.async { self.writer?.cancelWriting(); self.cleanUp(); call.resolve() }
    }

    private func cleanUp() {
        if let url = outputURL { try? FileManager.default.removeItem(at: url) }
        writer = nil; input = nil; adaptor = nil; outputURL = nil
    }

    private enum EncoderError: Error { case unavailable }
}
