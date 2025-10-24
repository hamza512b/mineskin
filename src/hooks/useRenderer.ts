import Webgl2Backend from "@/core/backend/Webgl2Backend";
import { RefObject, useEffect, useRef, useState } from "react";
import { MineSkinRenderer } from "../core/Renderer";
import { State } from "../core/State";

export function useRenderer(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const rendererRef = useRef<MineSkinRenderer>(null);
  const stateRef = useRef<State | null>(null);

  // UseEffect is guaranteed to run after the DOM is painted, but after it runs, we need to render.
  const [, setGeneration] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) {
      console.error("Canvas ref is null");
      return () => {};
    }

    const state = State.load();
    const backend = new Webgl2Backend(canvasRef.current);
    MineSkinRenderer.create(backend, state).then((renderer) => {
      rendererRef.current = renderer;
      stateRef.current = state;
      rendererRef.current?.mount();
      rendererRef.current?.start("parallaxEffect");
      setGeneration((generation) => generation + 1);
    });

    return () => {
      rendererRef.current?.stop();
      rendererRef.current?.unmount();
    };
  }, []);

  return rendererRef.current;
}
