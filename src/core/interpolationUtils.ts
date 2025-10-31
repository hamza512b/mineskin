export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

export const lerpVector3 = (
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] => {
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
  ];
};

export const smoothStep = (t: number): number => {
  return t * t * (3 - 2 * t);
};

export const smoothStepLerp = (a: number, b: number, t: number): number => {
  return lerp(a, b, smoothStep(t));
};

export const smoothStepLerpVector3 = (
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] => {
  const smoothT = smoothStep(t);
  return lerpVector3(a, b, smoothT);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};
