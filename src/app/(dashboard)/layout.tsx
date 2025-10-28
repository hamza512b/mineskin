"use client";
import { State } from "@/core/State";
import { useRendererState } from "@/hooks/useRendererState";
import { CAN_USE_DOM } from "@/lib/utils";
import React, { createContext, useContext, useEffect, useState } from "react";
export type StateContextType = ReturnType<typeof useRendererState>;
const StateContext = createContext<StateContextType | null>(null);

export function useSharedState() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useSharedState must be used within CanvasLayout");
  }
  return context;
}

export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state] = useState(() => (!CAN_USE_DOM ? new State() : State.load()));
  const { values, errors, handleChange, redoCount, undoCount } =
    useRendererState(state);
  useEffect(() => {
    return () => {
      state.save(); // Save state on unmount
    };
  });

  return (
    <StateContext.Provider
      value={{
        state,
        values,
        errors,
        handleChange,
        redoCount,
        undoCount,
      }}
    >
      {children}
    </StateContext.Provider>
  );
}
