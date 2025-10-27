"use client";
import Tutorial from "@/components/Tutorial/Tutorial";
import { MiSkiEditingRenderer } from "@/core/MineSkinRenderer";
import { useTutorialState } from "@/hooks/useTutorialState";
import { useState } from "react";
import { useSharedState } from "../layout";
import { Dashboard } from "../MineskinDashboard";

export default function EditorPage() {
  const state = useSharedState();
  const [renderer] = useState(() => new MiSkiEditingRenderer(state));

  const { hasCompletedTutorial } = useTutorialState();

  return (
    <Dashboard renderer={renderer} mode="Editing">
      {!hasCompletedTutorial && <Tutorial />}
    </Dashboard>
  );
}
