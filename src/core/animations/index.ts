import { MinecraftPart } from "../mesh";
import dance from "./dance.json";
import idle from "./idle.json";
import walking from "./walking.json";

export interface AnimationKeyframe {
  time: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
  scale?: [number, number, number];
}

export interface AnimationPartData {
  name: string;
  keyframes: AnimationKeyframe[];
}

export interface AnimationDefinition {
  name: string;
  label: string;
  duration: number;
  loop: boolean;
  parts: AnimationPartData[];
}

export interface PartTransform {
  rotation: [number, number, number];
  position: [number, number, number];
  scale: [number, number, number];
}

export interface AnimationBodyPart {
  name: string;
  base: MinecraftPart | null;
  overlay: MinecraftPart | null;
}

export const walkingAnimation = walking as AnimationDefinition;
export const idleAnimation = idle as AnimationDefinition;
export const danceAnimation = dance as AnimationDefinition;

export default [walkingAnimation, idleAnimation, danceAnimation];
