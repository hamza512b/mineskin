"use client";
import { State } from "@/core/State";
import { CAN_USE_DOM } from "@/lib/utils";
import React, { createContext, useContext, useState } from "react";

interface StateContextType {
  state: State;
}

const StateContext = createContext<StateContextType | null>(null);

export function useSharedState() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useSharedState must be used within CanvasLayout");
  }
  return context.state;
}

export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state] = useState(() => (!CAN_USE_DOM ? new State() : State.load()));

  return (
    <StateContext.Provider value={{ state }}>{children}</StateContext.Provider>
  );
}
