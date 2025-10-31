// Convert HSV to RGB
export function hsvToRgb(h: number, s: number, v: number) {
  s /= 100;
  v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// Convert RGB to Hex string
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (x: number) => x.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Convert HSV to Hex string
export function hsvToHex({ h, s, v }: { h: number; s: number; v: number }) {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

// Convert Hex string to RGB (returns null if invalid)
export function hexToRgb(hex?: string) {
  if (!hex) return null;
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) return null;
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
}

// Convert RGB to HSV
export function rgbToHsv(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) {
      h = 60 * (((g - b) / d) % 6);
    } else if (max === g) {
      h = 60 * ((b - r) / d + 2);
    } else {
      h = 60 * ((r - g) / d + 4);
    }
  }
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;
  return { h, s, v };
}

// Convert Hex string to HSV (fallback to red if invalid)
export function hexToHsv(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 0, s: 0, v: 0 };
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

// If the user enters shorthand hex (#RGB), expand it to full (#RRGGBB)
export function expandShorthand(hex: string): string {
  return (
    "#" +
    hex
      .slice(1)
      .split("")
      .map((char) => char + char)
      .join("")
  );
}

// Sort colors by hue, lightness, and saturation
export function sortColors(colors: string[]): string[] {
  return colors.sort((a, b) => {
    const hslA = hexToHsv(a);
    const hslB = hexToHsv(b);

    // Sort by hue first
    if (Math.abs(hslA.h - hslB.h) > 0.01) {
      return hslA.h - hslB.h;
    }

    // Then by lightness (darker colors first)
    if (Math.abs(hslA.v - hslB.v) > 0.01) {
      return hslB.v - hslA.v;
    }

    // Finally by saturation (more saturated colors first)
    return hslB.s - hslA.s;
  });
}

// Group colors by hue ranges
export function groupColorsByHue(colors: string[]): {
  [key: string]: string[];
} {
  const groups: { [key: string]: string[] } = {
    Red: [],
    Orange: [],
    Yellow: [],
    Green: [],
    Cyan: [],
    Blue: [],
    Purple: [],
    Magenta: [],
    Grays: [],
  };

  colors.forEach((color) => {
    const { h } = hexToHsv(color);

    // Group by hue ranges
    if (h < 15 || h > 345) groups["Red"].push(color);
    else if (h < 45) groups["Orange"].push(color);
    else if (h < 75) groups["Yellow"].push(color);
    else if (h < 165) groups["Green"].push(color);
    else if (h < 255) groups["Cyan"].push(color);
    else if (h < 285) groups["Blue"].push(color);
    else if (h < 315) groups["Purple"].push(color);
    else if (h < 345) groups["Magenta"].push(color);

    // Check if color is grayscale (very low saturation)
    const { s } = hexToHsv(color);
    if (s < 10) groups["Grays"].push(color);
  });

  // Sort colors within each group
  Object.keys(groups).forEach((key) => {
    groups[key] = sortColors(groups[key]);
  });

  return groups;
}
