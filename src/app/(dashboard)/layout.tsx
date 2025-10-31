"use client";
import { useInitRendererState } from "@/hooks/useRendererState";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useInitRendererState();

  return <>{children}</>;
}
