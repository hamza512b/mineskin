"use client";
import { MiSkPreviewRenderer } from "@/core/MiSkiRenderer";
import { useRendererStore } from "@/hooks/useRendererState";
import { useRef } from "react";
import { Dashboard } from "../MineskinDashboard";

export default function PreviewClient() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const state = useRendererStore((state) => state.state);

  if (!state) {
    return null;
  }
  return (
    <Dashboard
      rendererClass={MiSkPreviewRenderer}
      canvasRef={canvasRef}
      state={state}
      mode="Preview"
    />
  );
}
