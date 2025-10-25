"use client";
import { MiSkEditingRenderer } from "@/core/MineSkinRenderer";
import { useRenderer } from "@/hooks/useRenderer";
import { MineskinCanvas } from "../../../components/MineskinCanvas/MineskinCanvas";
import { useTutorialState } from "@/hooks/useTutorialState";
import Tutorial from "@/components/Tutorial/Tutorial";

export default function EditorPage() {
  const [renderer, setCanvas] = useRenderer(MiSkEditingRenderer);
  const { hasCompletedTutorial } = useTutorialState();

  return (
    <MineskinCanvas renderer={renderer} setCanvas={setCanvas}>
      {!hasCompletedTutorial && <Tutorial />}
    </MineskinCanvas>
  );
}

