"use client";
import Tutorial from "@/components/Tutorial/Tutorial";
import { MiSkiEditingRenderer } from "@/core/MineSkinRenderer";
import { useTutorialState } from "@/hooks/useTutorialState";
import { useSharedState } from "../layout";
import { Dashboard } from "../MineskinDashboard";
import useRenderer from "../useRenderer";
import { useRef } from "react";

export default function EditorPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { state, ...rest } = useSharedState();
  const renderer = useRenderer(MiSkiEditingRenderer, canvasRef, state);

  const { hasCompletedTutorial } = useTutorialState();

  return (
    <Dashboard
      renderer={renderer}
      mode="Editing"
      canvasRef={canvasRef}
      state={state}
      {...rest}
    >
      {!hasCompletedTutorial && <Tutorial />}
    </Dashboard>
  );
}
