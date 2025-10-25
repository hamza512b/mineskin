"use client";
import { MiSkPreviewRenderer } from "@/core/MineSkinRenderer";
import { useRenderer } from "@/hooks/useRenderer";
import { MineskinCanvas } from "../../../components/MineskinCanvas/MineskinCanvas";
import { useSharedState } from "../layout";

export default function PreviewPage() {
  const state = useSharedState();
  const [renderer, setCanvas] = useRenderer(MiSkPreviewRenderer, state);

  return (
    <MineskinCanvas renderer={renderer} setCanvas={setCanvas} mode="Preview" />
  );
}
