"use client";
import { MiSkEditingRenderer } from "@/core/MineSkinRenderer";
import { useRenderer } from "@/hooks/useRenderer";
import { MineskinCanvas } from "../../../components/MineskinCanvas/MineskinCanvas";
import { useTutorialState } from "@/hooks/useTutorialState";
import Tutorial from "@/components/Tutorial/Tutorial";
import { useSharedState } from "../layout";

export default function EditorPage() {
  const state = useSharedState();
  const [renderer, setCanvas] = useRenderer(MiSkEditingRenderer, state);
  const { hasCompletedTutorial } = useTutorialState();

  return (
    <MineskinCanvas renderer={renderer} setCanvas={setCanvas}>
      {!hasCompletedTutorial && <Tutorial />}
    </MineskinCanvas>
  );
}

