"use client";
import Tutorial from "@/components/Tutorial/Tutorial";
import { MiSkiEditingRenderer } from "@/core/MiSkiRenderer";
import { useRendererStore } from "@/hooks/useRendererState";
import { useRef } from "react";
import { Dashboard } from "../MineskinDashboard";

export default function EditorClient() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const state = useRendererStore((state) => state.state);

  const hasCompletedTutorial = useRendererStore(
    (state) => state.hasCompletedTutorial,
  );

  if (!state) {
    return null;
  }
  return (
    <Dashboard
      rendererClass={MiSkiEditingRenderer}
      state={state}
      canvasRef={canvasRef}
      mode="Editing"
    >
      {!hasCompletedTutorial && <Tutorial />}
    </Dashboard>
  );
}
