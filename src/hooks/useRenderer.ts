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

  renderer.addMesh(skin);
  renderer.backend.bindMeshGroup(skin);
}

export function useRenderer<T extends MiSkiRenderer>(
  rendererClass: new (state: State) => T,
  sharedState?: State,
): [T, (c: HTMLCanvasElement | null) => void] {
  const [renderer] = useState(() => {
    return new rendererClass(sharedState || State.load());
  });

  // UseEffect is guaranteed to run after the DOM is painted, but after it runs, we need to render.
  const [, setGeneration] = useState(0);

  // Cleanup function to save state and unmount renderer when component unmounts
  useEffect(() => {
    setup(renderer).then(() => {
      renderer?.mount();
      renderer?.start("parallaxEffect");
      setGeneration((generation) => generation + 1);
    });
    return () => {
      if (renderer) {
        renderer.stop();
        renderer.unmount();
      }
    };
  }, []);

  return [
    renderer,
    (canvas: HTMLCanvasElement | null) => {
      renderer?.backend.setCanvas(canvas);
    },
  ];
}
