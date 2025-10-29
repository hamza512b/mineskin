"use client";
import { State } from "@/core/State";
import {
  FieldErrors,
  FormValues,
  useRendererState,
} from "@/hooks/useRendererState";
import React, { createContext, useContext } from "react";

export type StateContextType = {
  state: State;
  errors: FieldErrors;
  values: FormValues;
  undoCount: number;
  redoCount: number;
  handleChange: (
    name: keyof FormValues,
    value: string | number | boolean,
    origin?: string,
  ) => void;
};
const StateContext = createContext<StateContextType | null>(null);

export function useSharedState() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useSharedState must be used within CanvasLayout");
  }
  return context;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sharedState = useRendererState();

  if (!sharedState || !sharedState.state) {
    return null;
  }

  return (
    <StateContext.Provider value={sharedState as StateContextType}>
      {children}
    </StateContext.Provider>
  );
}
