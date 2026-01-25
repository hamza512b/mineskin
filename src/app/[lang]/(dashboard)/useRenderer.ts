import { MiSkiRenderer } from "@/core/MiSkiRenderer";
import { State } from "@/core/State";
import { RefObject, useEffect, useRef, useState } from "react";

interface KlassRenderer {
  setup: (canvas: HTMLCanvasElement, state: State) => Promise<MiSkiRenderer>;
}

export default function useRenderer(
  KlassRenderer: KlassRenderer,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  state: State,
): MiSkiRenderer | null {
  const rendererRef = useRef<MiSkiRenderer>(null);

  // UseEffect is guaranteed to run after the DOM is painted, but after it runs, we need to render.
  const [, setGeneration] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) {
      console.error("Canvas ref is null");
      return () => {};
    }

    let isMounted = true;

    KlassRenderer.setup(canvasRef.current, state).then((renderer) => {
      if (!isMounted) {
        // Component was unmounted before setup completed, cleanup immediately
        renderer.stop();
        renderer.unmount();
        return;
      }

      rendererRef.current = renderer;
      rendererRef.current.mount();
      rendererRef.current.start();
      setGeneration((generation) => generation + 1);
    });

    setGeneration((generation) => generation + 1);

    return () => {
      isMounted = false;
      // Use a direct reference to ensure cleanup happens
      const renderer = rendererRef.current;
      if (renderer) {
        renderer.stop();
        renderer.unmount();
        rendererRef.current = null;
      }
    };
  }, []);

  return rendererRef.current;
}
