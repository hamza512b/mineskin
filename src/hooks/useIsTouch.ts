"use client";
import { useEffect, useState } from "react";

// Tracks whether the user is currently interacting via touch.
// `(pointer: coarse)` alone misclassifies desktops with touchscreens; we seed
// from a media query and then correct based on the most recent pointerdown.
const useIsTouch = () => {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(
      window.matchMedia("(pointer: coarse)").matches &&
        !window.matchMedia("(hover: hover)").matches,
    );
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        setIsTouch(true);
      } else if (e.pointerType === "mouse" || e.pointerType === "pen") {
        setIsTouch(false);
      }
    };
    window.addEventListener("pointerdown", onDown, true);
    return () => window.removeEventListener("pointerdown", onDown, true);
  }, []);
  return isTouch;
};

export default useIsTouch;
