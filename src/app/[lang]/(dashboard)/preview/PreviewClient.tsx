"use client";
import { MiSkPreviewRenderer } from "@/core/MiSkiRenderer";
import { useRef } from "react";
import { Dashboard } from "../MineskinDashboard";

export default function PreviewClient() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  return (
    <>
      <Dashboard
        rendererClass={MiSkPreviewRenderer}
        canvasRef={canvasRef}
        mode="Preview"
      />
      {/* <AppInstallBanner /> */}
    </>
  );
}
