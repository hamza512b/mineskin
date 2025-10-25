"use client";
import { MiSkPreviewRenderer } from "@/core/MineSkinRenderer";
import { useRenderer } from "@/hooks/useRenderer";
import React from "react";
import { MineskinCanvas } from "../../../components/MineskinCanvas/MineskinCanvas";

export default function PreviewPage() {
  const [renderer, setCanvas] = useRenderer(MiSkPreviewRenderer);

  return <MineskinCanvas renderer={renderer} setCanvas={setCanvas} />;
}

