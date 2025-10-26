import { MinecraftSkin } from "@/core/MinecraftSkin";
import { useEffect, useRef, useState } from "react";
import { MiSkiRenderer } from "../core/MineSkinRenderer";
import { State } from "../core/State";

const DEFAULT_SKIN = "/steve.png";

export async function setup<T extends MiSkiRenderer>(renderer: T) {
  await renderer.state.initializeIndexDB();
  const old_skin_base64URL = localStorage.getItem("skin_editor");
  const texture = await renderer.state.readSkinImageData("main_skin");

  let skin: MinecraftSkin;
  if (old_skin_base64URL && !texture) {
    skin = await MinecraftSkin.create(
      "MainSkin",
      renderer.world,
      old_skin_base64URL,
    );
  } else {
    skin = await MinecraftSkin.create(
      "MainSkin",
      renderer.world,
      texture || DEFAULT_SKIN,
    );
  }
  renderer.state.setSkinIsPocket(
    skin.material.version === "slim",
    true,
    "classic",
  );

  document.body.setAttribute("data-skin-version", skin.material.version);
  renderer.addMesh(skin);
  renderer.backend.bindMeshGroup(skin);
}

export function useRenderer<T extends MiSkiRenderer>(
  rendererClass: new (state: State) => T,
  sharedState?: State,
): [T, (c: HTMLCanvasElement | null) => void] {
  const rendererRef = useRef<T | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // UseEffect is guaranteed to run after the DOM is painted, but after it runs, we need to render.
  const [, setGeneration] = useState(0);

  // Cleanup function to save state and unmount renderer when component unmounts
  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        rendererRef.current.stop();
        rendererRef.current.unmount();
      }
    };
  }, [sharedState]);

  return [
    rendererRef.current!,
    (canvas: HTMLCanvasElement | null) => {
      if (!rendererRef.current?.backend.canvas && !!canvas) {
        canvasRef.current = canvas;
        const state = sharedState || State.load();
        rendererRef.current = new rendererClass(state);
        rendererRef.current?.backend.setCanvas(canvas);
        setup(rendererRef.current!).then(() => {
          rendererRef.current?.mount();
          rendererRef.current?.start("parallaxEffect");
          setGeneration((generation) => generation + 1);
        });
      }
    },
  ];
}
