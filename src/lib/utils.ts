import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}


export const CAN_USE_DOM = typeof window !== "undefined";