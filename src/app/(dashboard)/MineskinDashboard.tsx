"use client";
import ClientOnly from "@/components/ClientOnly/ClientOnly";
import GlobalRotationGizmo from "@/components/RotationGizmo/RotationGizmo";
import {
  MiSkiEditingRenderer,
  MiSkPreviewRenderer,
} from "@/core/MiSkiRenderer";
import { State } from "@/core/State";
import { useRendererStore } from "@/hooks/useRendererState";
import ActionBar from "@/widgets/ActionBar/ActionBar";
import DetailPanel from "@/widgets/DetailPanel/DetailPanel";
import DesktopPartFilter from "@/widgets/PartFilterDialog/DesktopPartFilter";
import Toolbar from "@/widgets/Toolbar/Toolbar";
import Head from "next/head";
import React, { RefObject, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import useRenderer from "./useRenderer";

export function Dashboard({
  rendererClass,
  children,
  canvasRef,
  state,
  mode,
}: {
  children?: React.ReactNode;
  rendererClass: any;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  state: State;
  mode: "Editing" | "Preview";
}) {
  const renderer = useRenderer(rendererClass, canvasRef, state);
  const undoCount = useRendererStore((state) => state.undoCount);
  const redoCount = useRendererStore((state) => state.redoCount);
  const [controlPanelOpen, setControlPanelOpen] = useState(false);

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
    renderer?.downloadTexture();
  }, [renderer]);

  const uploadTexture = useCallback(() => {
    renderer?.uploadTexture((err) =>
      toast.error(err, {
        position: "bottom-center",
      }),
    );
  }, [renderer]);

  const reset = useCallback(() => {
    renderer?.reset();
  }, [renderer]);

  const getUniqueColors = useCallback((): string[] => {
    return renderer instanceof MiSkiEditingRenderer
      ? renderer.getUniqueColors()
      : [];
  }, [renderer]);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <div className="relative flex justify-between h-dvh w-full overflow-hidden bg-grid">
        <div className="relative flex-1" data-tutorial-id="main">
          <canvas ref={canvasRef} className="w-full h-full select-none" />

          {children}

          <div className="absolute top-0 right-0 p-2 pointer-events-none z-0 flex gap-2">
            <div className="flex flex-col gap-6 p-2">
              <GlobalRotationGizmo />
              <DesktopPartFilter className="hidden md:flex" />
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
              getUniqueColors={getUniqueColors}
              availableAnimations={availableAnimations}
              currentAnimation={currentAnimation}
              onAnimationSelect={handleAnimationSelect}
              mode={mode}
            />
          </ClientOnly>
          <ActionBar
            className={"absolute bottom-0 left-0 right-0"}
            downlodTexture={downloadTexture}
            uploadTexture={uploadTexture}
            mode={mode}
          />
        </div>

        {/* Collapsable */}
        <DetailPanel
          open={controlPanelOpen}
          setOpen={setControlPanelOpen}
          reset={reset}
          mode={mode}
        />
      </div>
    </>
  );
}
