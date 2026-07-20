import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// The shading brush varies brightness in discrete 5%-per-rung steps.
// `variationIntensity` is the number of rungs a stroke may swing (minimum 1), and
// this is its ceiling — 6 rungs ≈ 30% brightness. Shared by the renderer, the
// store schema/defaults, and the intensity steppers so they never drift apart.
export const MAX_VARIATION_STEPS = 6;


export const CAN_USE_DOM = typeof window !== "undefined";
