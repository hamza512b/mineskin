import { useRenderer } from "@/hooks/useRenderer";
import { useRendererState } from "@/hooks/useRendererState";
import DetailPanel from "@/widgets/DetailPanel/DetailPanel";
import Toolbar from "@/widgets/Toolbar/Toolbar";
import ActionBar from "@/widgets/ActionBar/ActionBar";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import GlobalRotationGizmo from "@/components/RotationGizmo/RotationGizmo";
import PartsPreview from "@/widgets/PartsPreview/PartsPreview";
export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");
  const renderer = useRenderer(canvasRef);
  const [controlPanelOpen, setControlPanelOpen] = useState(false);
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError("");
      }, 4000);

      return () => {
        clearTimeout(timeout);
      };
    }

    return () => {};
  }, [error]);

  const { values, errors, handleChange, redoCount, undoCount } =
    useRendererState(renderer);
  return (
    <>
      <Head>
        <title> Minecraft Skin Editor and Tester | Mineskin.pro</title>
        <meta
          name="description"
          content="Upload and test your Minecraft skins in real-time with MineSkin's 3D viewer. Test, edit, and see your skin from every angle before using it in-game."
        />
        <meta
          name="keywords"
          content="minecraft skin, minecraft skin tester, minecraft skin editor, minecraft skin preview, 3d skin viewer, minecraft character, skin editor, minecraft avatar"
        />
        <meta name="author" content="Hamza512b" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://mineskin.pro/" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mineskin.pro/" />
        <meta
          property="og:title"
          content="Minecraft Skin Editor & Tester | Mineskin.pro"
        />
        <meta
          property="og:description"
          content="Upload and preview your Minecraft skins in real-time with MineSkin's 3D viewer. Test, edit, and see your skin from every angle before using it in-game."
        />
        <meta property="og:image" content="https://mineskin.pro/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://mineskin.pro/" />
        <meta
          property="twitter:title"
          content="Minecraft Skin Editor & Tester | Mineskin.pro"
        />
        <meta
          property="twitter:description"
          content="Upload and preview your Minecraft skins in real-time with MineSkin's 3D viewer. Test, edit, and see your skin from every angle before using it in-game."
        />
        <meta
          property="twitter:image"
          content="https://mineskin.pro/og-image.jpg"
        />

        {/* Structured data for rich search results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "MineSkin - Minecraft Skin Editor & Tester",
              description:
                "Upload and preview your Minecraft skins in real-time with MineSkin's 3D viewer. Test, edit, and see your skin from every angle before using it in-game.",
              image: "https://mineskin.pro/og-image.jpg",
              url: "https://mineskin.pro/",
              applicationCategory: "GameApplication",
              operatingSystem: "Any",
              author: {
                "@type": "Person",
                name: "Hamza512b",
              },
            }),
          }}
        />
      </Head>

      <div className="relative flex justify-between h-dvh w-full overflow-hidden">
        <div className="relative flex-1">
          <canvas ref={canvasRef} className="w-full h-full" />
          {/* <div className="absolute bottom-0 left-0 p-3 md:p-4 flex flex-col items-end gap-2 w-full">
            {error && <p className="text-red-500 block md:hidden">{error}</p>}
            <div className="flex gap-2 justify-between w-full items-center">
              <div className="flex gap-4 items-center">
                <p className="text-red-500 md:block hidden">{error}</p>
              </div>
            </div>
          </div> */}
          <div className="absolute top-0 right-0 p-4 pointer-events-none z-0">
            <GlobalRotationGizmo
              rotation={[values.cameraPhi, values.cameraTheta, 0]}
              onRotationChange={(rotation) => {
                handleChange("cameraPhi", rotation[0]);
                handleChange("cameraTheta", rotation[1]);
              }}
            />
            <PartsPreview values={values} className="w-min mx-auto mt-8" />
          </div>

          <Toolbar
            renderer={renderer}
            values={values}
            setValues={handleChange}
            redo={() => renderer?.redo()}
            undo={() => renderer?.undo()}
            redoCount={redoCount}
            undoCount={undoCount}
            setColorPickerActive={(active) =>
              handleChange("colorPickerActive", active)
            }
            colorPickerActive={values.colorPickerActive}
            setPaintMode={(mode) => handleChange("paintMode", mode)}
            paintMode={values.paintMode}
            settingsOpen={controlPanelOpen}
            setSettingsOpen={setControlPanelOpen}
          />
          <ActionBar
            className={"absolute bottom-0 left-0 right-0"}
            downlodTexture={() => {
              renderer?.downloadTexture();
            }}
            uploadTexture={() => {
              renderer?.uploadTexture(setError);
            }}
            mode={values.mode}
            setMode={(mode) => {
              handleChange("mode", mode);
            }}
          />
        </div>

        {/* Collapsable */}
        <DetailPanel
          handleChange={handleChange}
          errors={errors}
          values={values}
          open={controlPanelOpen}
          setOpen={setControlPanelOpen}
          mode={"preview"}
          reset={() => {
            renderer?.reset();
          }}
        />
      </div>
    </>
  );
}
