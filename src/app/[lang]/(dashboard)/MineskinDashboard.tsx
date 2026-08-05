"use client";
import ClientOnly from "@/components/ClientOnly/ClientOnly";
import GlobalRotationGizmo from "@/components/RotationGizmo/RotationGizmo";
import {
  MiSkiRenderer,
  MiSkiEditingRenderer,
  MiSkPreviewRenderer,
} from "@/core/MiSkiRenderer";
import { useRendererStore, selectUndoCount, selectRedoCount } from "@/store";
import { getLibraryState } from "@/store/libraryStore";
import ActionBar from "@/widgets/ActionBar/ActionBar";
import DetailPanel from "@/widgets/DetailPanel/DetailPanel";
import ReferencePanel from "@/widgets/ReferencePanel/ReferencePanel";
import DesktopPartFilter from "@/widgets/PartFilterDialog/DesktopPartFilter";
import Toolbar from "@/widgets/Toolbar/Toolbar";
import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useRenderer from "./useRenderer";
import useIsTouch from "@/hooks/useIsTouch";
import { downloadFile } from "@/core/downloadFile";
import { shareVideo } from "@/core/shareVideo";
import {
  DEFAULT_WATERMARK,
  drawWatermark,
  loadWatermarkLogo,
} from "@/core/watermark";
import { RecorderNotSupportedError } from "@/core/errors";
import RecorderOverlay from "@/components/RecorderOverlay/RecorderOverlay";
import RecorderPreviewDialog, {
  type PreviewClip,
} from "@/components/RecorderOverlay/RecorderPreviewDialog";
import { useDictionary } from "@/i18n";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

/** Exported screenshot edge length; matches the recorded clip's 1080px width. */
const SCREENSHOT_SIZE = 1080;

/** How far the visible canvas region's center sits from the window's, in px. */
const CANVAS_CENTER_VAR = "--canvas-center-offset";
/** Sonner's toast width (356px) plus breathing room on both sides. */
const MIN_CENTERED_TOAST_WIDTH = 400;

type RendererClass = {
  setup: (canvas: HTMLCanvasElement) => Promise<MiSkiRenderer>;
};

export function Dashboard({
  rendererClass,
  children,
  canvasRef,
  mode,
}: {
  children?: React.ReactNode;
  rendererClass: RendererClass;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  mode: "Editing" | "Preview";
}) {
  const { renderer, backendNotSupported } = useRenderer(
    rendererClass,
    canvasRef,
  );
  const { dictionary: dict } = useDictionary();
  const undoCount = useRendererStore(selectUndoCount);
  const redoCount = useRendererStore(selectRedoCount);
  const environmentPreset = useRendererStore(
    (state) => state.environmentPreset,
  );
  const [controlPanelOpen, setControlPanelOpen] = useState(false);
  const [referencePanelOpen, setReferencePanelOpen] = useState(false);
  const isFine = !useIsTouch();

  // The 3D canvas is a full-screen `fixed` layer painted behind the workspace
  // chrome, and it stays full-screen even when the settings panel docks on the
  // trailing edge. Rather than shrinking the canvas, we tell the renderer how
  // far the visible main (flex-1) region's center has drifted from the canvas
  // center, and it shifts the projection horizontally so the model recenters
  // into the still-visible area (the canvas keeps bleeding behind the panel).
  // Flex already computes the exact remaining width (gap included), so
  // measuring that box keeps this RTL-safe; on touch the panel is a drawer and
  // the region is full-width, so the offset is 0.
  const mainRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const main = mainRef.current;
    const canvas = canvasRef.current;
    const backend = renderer?.backend;
    if (!main || !canvas || !backend) return;
    const sync = () => {
      const mainRect = main.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const mainCenter = mainRect.left + mainRect.width / 2;
      const canvasCenter = canvasRect.left + canvasRect.width / 2;
      const offset = mainCenter - canvasCenter;
      backend.setViewportCenterOffset(offset);
      // Published for anything that sits outside this tree and still wants to
      // line up with the model — the toasts, which would otherwise center on
      // the window and end up half-hidden under a docked panel. Falling back to
      // 0 when the region is too narrow to hold a toast keeps it on screen, and
      // pages without a canvas never set the variable at all, so they center on
      // the window as usual.
      document.documentElement.style.setProperty(
        CANVAS_CENTER_VAR,
        `${mainRect.width >= MIN_CENTERED_TOAST_WIDTH ? Math.round(offset) : 0}px`,
      );
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(main);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
      backend.setViewportCenterOffset(0);
      document.documentElement.style.removeProperty(CANVAS_CENTER_VAR);
    };
  }, [canvasRef, backendNotSupported, renderer]);

  // R toggles the reference panel. It lives here rather than in
  // EditInputManager's shortcut block because the panel's open state is React
  // state, not renderer state — but the guards mirror that block so bare-letter
  // shortcuts stay out of typing contexts and browser combos.
  useEffect(() => {
    if (mode !== "Editing") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== "r") return;
      const target = e.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }
      setReferencePanelOpen((open) => !open);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mode]);

  // Animation-related state and functions
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);

  const availableAnimations = useMemo(() => {
    if (renderer instanceof MiSkPreviewRenderer) {
      return renderer.getAvailableAnimations();
    }
    return [];
  }, [renderer]);

  const handleAnimationSelect = useCallback(
    (animation: string | null) => {
      if (renderer instanceof MiSkPreviewRenderer) {
        if (animation === null) {
          renderer.stopAnimation();
          setCurrentAnimation(null);
        } else {
          renderer.playAnimation(animation);
          setCurrentAnimation(animation);
        }
      }
    },
    [renderer],
  );

  const [lookAtCursor, setLookAtCursor] = useState(false);

  const handleToggleLookAtCursor = useCallback(() => {
    if (renderer instanceof MiSkPreviewRenderer) {
      if (renderer.lookAtCursorEnabled) {
        renderer.disableLookAtCursor();
        setLookAtCursor(false);
      } else {
        renderer.enableLookAtCursor();
        setLookAtCursor(true);
      }
    }
  }, [renderer]);

  const setSettingsOpen = useCallback(
    (open: boolean) => {
      setControlPanelOpen(open);
    },
    [setControlPanelOpen],
  );

  const undo = useCallback(() => {
    renderer?.undo();
  }, [renderer]);

  const redo = useCallback(() => {
    renderer?.redo();
  }, [renderer]);

  const downloadTexture = useCallback(() => {
    const activeEntry = getLibraryState().getActiveEntry();
    renderer?.downloadTexture(activeEntry?.name, dict.saveImage);
    window.gtag?.("event", "skin_exported", {
      format: "png",
      named: !!activeEntry?.name,
    });
  }, [renderer, dict]);

  const reset = useCallback(() => {
    renderer?.reset();
  }, [renderer]);

  const handlePocketSwitch = useCallback(
    (newIsPocket: boolean) => {
      renderer?.handlePocketSwitch(newIsPocket);
    },
    [renderer],
  );

  const handleResolutionSwitch = useCallback(
    (newIsDoubleRes: boolean) => {
      renderer?.handleResolutionSwitch(newIsDoubleRes);
    },
    [renderer],
  );

  const handleFlipFrontToBack = useCallback(() => {
    renderer?.flipFrontToBack();
  }, [renderer]);

  const getUniqueColors = useCallback((): string[] => {
    return renderer instanceof MiSkiEditingRenderer
      ? renderer.getUniqueColors()
      : [];
  }, [renderer]);

  const handleScreenshot = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Crop the largest centered square from the live canvas...
    const size = Math.min(canvas.width, canvas.height);
    const sx = Math.floor((canvas.width - size) / 2);
    const sy = Math.floor((canvas.height - size) / 2);
    // ...then export it at a fixed resolution (matching the clip's 1080px
    // width) so screenshots are consistent across devices and the watermark
    // renders at the same proportions as recorded clips.
    const output = SCREENSHOT_SIZE;
    const offscreen = document.createElement("canvas");
    offscreen.width = output;
    offscreen.height = output;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;
    const backend = renderer?.backend;
    // Captures always crop the canvas center, so render the model centered even
    // when a docked panel has shifted it off-center on screen; restore after.
    const prevOffset = backend?.getViewportCenterOffset() ?? 0;
    if (backend) {
      backend.setEnvironmentGridSuppressed(true);
      backend.setViewportCenterOffset(0);
      backend.onRenderFrame(renderer);
    }
    ctx.drawImage(canvas, sx, sy, size, size, 0, 0, output, output);
    if (backend) {
      backend.setEnvironmentGridSuppressed(false);
      backend.setViewportCenterOffset(prevOffset);
    }
    // Bake in the same attribution pill shared clips carry.
    const logo = await loadWatermarkLogo();
    drawWatermark(ctx, output, output, {
      text: DEFAULT_WATERMARK,
      logo,
      align: "right",
    });
    const dataUrl = offscreen.toDataURL("image/png");
    const activeEntry = getLibraryState().getActiveEntry();
    const base = activeEntry?.name?.trim() || "mineskin";
    const filename = `${base}.png`.replace(/[^\w.-]+/g, "_");
    // Show the preview dialog; the save hand-off happens on an explicit tap so
    // the iOS share sheet stays inside a user gesture.
    setPreviewClip({
      dataUrl,
      url: dataUrl,
      filename,
      extension: "png",
      kind: "image",
    });
  }, [canvasRef, renderer]);

  // One-tap "record a shareable clip": spin + animate the model, composite to
  // 9:16 with a watermark, then hand off to the native/web share sheet.
  const [recording, setRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [recordError, setRecordError] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const recordAbortRef = useRef<AbortController | null>(null);
  // Recorded clip or captured screenshot awaiting the user's preview + share
  // decision. Video previews carry a `blob` (shared via shareVideo); image
  // previews carry a `dataUrl` (saved via downloadFile).
  const [previewClip, setPreviewClip] = useState<
    (PreviewClip & { blob?: Blob; dataUrl?: string }) | null
  >(null);
  const [sharing, setSharing] = useState(false);

  const closePreview = useCallback(() => {
    setPreviewClip((clip) => {
      if (clip) URL.revokeObjectURL(clip.url);
      return null;
    });
    setSharing(false);
  }, []);

  const handleRecord = useCallback(async () => {
    if (!(renderer instanceof MiSkPreviewRenderer) || recording) return;
    if (!renderer.canRecordClip()) {
      setRecordError({
        title: dict.recorder.unsupportedTitle,
        message: dict.recorder.unsupportedMessage,
      });
      return;
    }

    const controller = new AbortController();
    recordAbortRef.current = controller;
    setRecordProgress(0);
    setRecording(true);
    try {
      const clip = await renderer.recordClip({
        onProgress: setRecordProgress,
        signal: controller.signal,
      });
      const activeEntry = getLibraryState().getActiveEntry();
      const base = activeEntry?.name?.trim() || "mineskin";
      const filename = `${base}.${clip.extension}`.replace(/[^\w.-]+/g, "_");
      // Show the preview dialog; the share hand-off happens on an explicit tap.
      setPreviewClip({
        blob: clip.blob,
        url: clip.previewUrl ?? URL.createObjectURL(clip.blob),
        filename,
        extension: clip.extension,
        kind: "video",
      });
      window.gtag?.("event", "clip_recorded", { format: clip.extension });
    } catch (e) {
      // User cancelled — leave quietly.
      if (e instanceof DOMException && e.name === "AbortError") return;
      const unsupported = e instanceof RecorderNotSupportedError;
      if (!unsupported) console.error("Failed to record clip", e);
      setRecordError({
        title: unsupported
          ? dict.recorder.unsupportedTitle
          : dict.recorder.failedTitle,
        message: unsupported
          ? dict.recorder.unsupportedMessage
          : dict.recorder.failedMessage,
      });
    } finally {
      recordAbortRef.current = null;
      setRecording(false);
      setRecordProgress(0);
    }
  }, [renderer, recording, dict]);

  const handleCancelRecord = useCallback(() => {
    recordAbortRef.current?.abort();
  }, []);

  const handleShareClip = useCallback(async () => {
    if (!previewClip || sharing) return;
    setSharing(true);
    try {
      // A screenshot saves through the image pipeline (native share sheet /
      // long-press sheet / anchor download); a clip shares through shareVideo.
      if (previewClip.kind === "image" && previewClip.dataUrl) {
        const result = await downloadFile(
          previewClip.dataUrl,
          previewClip.filename,
          dict.saveImage,
        );
        if (result !== "cancelled") {
          window.gtag?.("event", "screenshot_saved", { result });
          closePreview();
        } else {
          setSharing(false);
        }
        return;
      }
      if (!previewClip.blob) return;
      const result = await shareVideo(previewClip.blob, previewClip.filename);
      window.gtag?.("event", "clip_shared", {
        format: previewClip.extension,
        result,
      });
      if (result !== "cancelled") closePreview();
      else setSharing(false);
    } catch (e) {
      console.error("Failed to share clip", e);
      setSharing(false);
    }
  }, [previewClip, sharing, closePreview, dict]);

  if (backendNotSupported) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <div className="mx-4 max-w-md text-center">
          <ExclamationTriangleIcon className="mx-auto mb-6 size-16 text-red-300 dark:text-red-600" />
          <h1 className="mb-3 text-2xl font-bold text-neutral-900 dark:text-white">
            {dict.error.unsupportedDeviceTitle}
          </h1>
          <p className="mb-8 text-neutral-600 dark:text-neutral-400">
            {dict.error.unsupportedDeviceDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 w-full h-full select-none touch-none ${
          environmentPreset === "grid" || environmentPreset === "empty"
            ? "bg-radial from-neutral-100 via-neutral-100 to-neutral-200 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-950"
            : ""
        }`}
        style={{
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          top: "var(--app-banner-height, 0px)",
        }}
      />
      <div
        className="fixed inset-x-0 bottom-0 flex justify-between gap-2 overflow-hidden safe-area-pb safe-area-pl safe-area-pr pointer-events-none"
        style={{
          top: "max(env(safe-area-inset-top, 0px), var(--app-banner-height, 0px))",
        }}
      >
        {/* Docks on the leading edge (RTL-flipped by flex order) so it can sit
            open alongside the settings panel rather than competing with it. */}
        {mode === "Editing" && (
          <ReferencePanel
            open={referencePanelOpen}
            setOpen={setReferencePanelOpen}
          />
        )}

        <div
          ref={mainRef}
          className="relative min-w-0 flex-1"
          data-tutorial-id="main"
        >
          {children}

          <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 p-2 pointer-events-none z-0 flex gap-2">
            <div className="flex flex-col gap-6 p-2">
              <GlobalRotationGizmo />
              {isFine && <DesktopPartFilter />}
            </div>
          </div>

          <ClientOnly>
            <Toolbar
              redo={redo}
              undo={undo}
              redoCount={redoCount}
              undoCount={undoCount}
              settingsOpen={controlPanelOpen}
              setSettingsOpen={setSettingsOpen}
              referenceOpen={referencePanelOpen}
              setReferenceOpen={setReferencePanelOpen}
              getUniqueColors={getUniqueColors}
              availableAnimations={availableAnimations}
              currentAnimation={currentAnimation}
              onAnimationSelect={handleAnimationSelect}
              lookAtCursor={lookAtCursor}
              onToggleLookAtCursor={handleToggleLookAtCursor}
              onScreenshot={handleScreenshot}
              onRecord={mode === "Preview" ? handleRecord : undefined}
              recording={recording}
              mode={mode}
            />
          </ClientOnly>
          <ActionBar
            className={"absolute bottom-0 left-0 right-0"}
            renderer={renderer}
            downloadTexture={downloadTexture}
            mode={mode}
          />
        </div>

        {/* Collapsable */}
        <DetailPanel
          open={controlPanelOpen}
          setOpen={setControlPanelOpen}
          reset={reset}
          mode={mode}
          handlePocketSwitch={handlePocketSwitch}
          handleResolutionSwitch={handleResolutionSwitch}
          handleFlipFrontToBack={handleFlipFrontToBack}
        />
      </div>

      <RecorderOverlay
        recording={recording}
        progress={recordProgress}
        error={recordError}
        onCancel={handleCancelRecord}
        onDismissError={() => setRecordError(null)}
      />

      <RecorderPreviewDialog
        clip={previewClip}
        sharing={sharing}
        onShare={handleShareClip}
        onClose={closePreview}
      />
    </>
  );
}
