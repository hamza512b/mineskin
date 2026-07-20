"use client";
import Tutorial from "@/components/Tutorial/Tutorial";
import { MiSkiEditingRenderer } from "@/core/MiSkiRenderer";
import { useRendererStore } from "@/store";
import { useRef } from "react";
import { Dashboard } from "../MineskinDashboard";

export default function EditorClient() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const hasCompletedTutorial = useRendererStore(
    (state) => state.hasCompletedTutorial,
  );

  return (
    <Dashboard
      rendererClass={MiSkiEditingRenderer}
      canvasRef={canvasRef}
      mode="Editing"
    >
      {!hasCompletedTutorial && <Tutorial />}
    </Dashboard>
  );
}
