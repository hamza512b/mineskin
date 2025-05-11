import { useRenderer } from "@/hooks/useRenderer";
import { useRendererState } from "@/hooks/useRendererState";
import DetailPanel from "@/widgets/DetailPanel/DetailPanel";
import Toolbar from "@/widgets/Toolbar/Toolbar";
import ActionBar, { Mode } from "@/widgets/ActionBar/ActionBar";
import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";
import GlobalRotationGizmo from "@/components/RotationGizmo/RotationGizmo";
import PartsPreview from "@/widgets/tableOfContents/PartsPreview";
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

  const setColorPickerActive = useCallback(
    (active: boolean) => {
      handleChange("colorPickerActive", active);
    },
    [handleChange],
  );

  const setPaintMode = useCallback(
    (mode: "pixel" | "bulk" | "eraser") => {
      handleChange("paintMode", mode);
    },
    [handleChange],
  );

  const setSettingsOpen = useCallback(
    (open: boolean) => {
      setControlPanelOpen(open);
    },
    [setControlPanelOpen],
  );

  const setMode = useCallback(
    (mode: Mode) => {
      handleChange("mode", mode);
    },
    [handleChange],
  );

  const undo = useCallback(() => {
    renderer?.undo();
  }, [renderer]);

  const redo = useCallback(() => {
    renderer?.redo();
  }, [renderer]);

  const downloadTexture = useCallback(() => {
    renderer?.downloadTexture();
  }, [renderer]);

  const uploadTexture = useCallback(() => {
    renderer?.uploadTexture();
  }, [renderer]);

  const reset = useCallback(() => {
    renderer?.reset();
  }, [renderer]);

  const getUniqueColors = useCallback((): string[] => {
    return renderer?.getUniqueColors() || [];
  }, [renderer]);

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
            setValues={handleChange}
            redo={redo}
            undo={undo}
            redoCount={redoCount}
            undoCount={undoCount}
            setColorPickerActive={setColorPickerActive}
            colorPickerActive={values.colorPickerActive}
            setPaintMode={setPaintMode}
            paintMode={values.paintMode}
            settingsOpen={controlPanelOpen}
            setSettingsOpen={setSettingsOpen}
            getUniqueColors={getUniqueColors}
            mode={values.mode}
            paintColor={values.paintColor}
            baseheadVisible={values.baseheadVisible}
            basebodyVisible={values.basebodyVisible}
            baseleftArmVisible={values.baseleftArmVisible}
            baserightArmVisible={values.baserightArmVisible}
            baseleftLegVisible={values.baseleftLegVisible}
            baserightLegVisible={values.baserightLegVisible}
            overlayheadVisible={values.overlayheadVisible}
            overlaybodyVisible={values.overlaybodyVisible}
            overlayleftArmVisible={values.overlayleftArmVisible}
            overlayrightArmVisible={values.overlayrightArmVisible}
            overlayleftLegVisible={values.overlayleftLegVisible}
            overlayrightLegVisible={values.overlayrightLegVisible}
          />
          <ActionBar
            className={"absolute bottom-0 left-0 right-0"}
            downlodTexture={downloadTexture}
            uploadTexture={uploadTexture}
            mode={values.mode}
            setMode={setMode}
          />
        </div>

        {/* Collapsable */}
        <DetailPanel
          handleChange={handleChange}
          errors={errors}
          open={controlPanelOpen}
          setOpen={setControlPanelOpen}
          mode={"preview"}
          reset={reset}
          skinIsPocket={values.skinIsPocket}
          diffuseStrength={values.diffuseStrength}
          specularStrength={values.specularStrength}
          objectTranslationX={values.objectTranslationX}
          objectTranslationZ={values.objectTranslationZ}
          objectTranslationY={values.objectTranslationY}
          objectRotationX={values.objectRotationX}
          objectRotationY={values.objectRotationY}
          objectRotationZ={values.objectRotationZ}
          cameraFieldOfView={values.cameraFieldOfView}
          cameraSpeed={values.cameraSpeed}
          cameraDampingFactor={values.cameraDampingFactor}
          // cameraRadius={values.cameraRadius}
          // cameraTheta={values.cameraTheta}
          // cameraPhi={values.cameraPhi}
          directionalLightIntensity={values.directionalLightIntensity}
          ambientLight={values.ambientLight}
          diffuseLightPositionX={values.diffuseLightPositionX}
          diffuseLightPositionZ={values.diffuseLightPositionZ}
          diffuseLightPositionY={values.diffuseLightPositionY}
        />
      </div>
    </>
  );
}
