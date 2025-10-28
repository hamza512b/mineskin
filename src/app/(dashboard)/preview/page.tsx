"use client";
import { MiSkPreviewRenderer } from "@/core/MineSkinRenderer";
import { useRef } from "react";
import { Dashboard } from "../MineskinDashboard";
import { useSharedState } from "../layout";
import useRenderer from "../useRenderer";

export default function PreviewPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { state, ...rest } = useSharedState();
  const renderer = useRenderer(MiSkPreviewRenderer, canvasRef, state);
  return (
    <Dashboard
      renderer={renderer}
      mode="Preview"
      canvasRef={canvasRef}
      state={state}
      {...rest}
    />
  );
}
