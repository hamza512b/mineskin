"use client";
import { MiSkPreviewRenderer } from "@/core/MineSkinRenderer";
import { Dashboard } from "../MineskinDashboard";
import { useSharedState } from "../layout";
import { useState } from "react";

export default function PreviewPage() {
  const state = useSharedState();
  const [renderer] = useState(() => new MiSkPreviewRenderer(state));

  return <Dashboard renderer={renderer} mode="Preview" />;
}
