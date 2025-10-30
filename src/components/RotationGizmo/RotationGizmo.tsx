import clsx from "clsx";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { multiplyM3V3, rotateM33 } from "../../core/maths";
import useMediaQuery from "../../hooks/useMediaQuery";
import { useRendererStore } from "../../hooks/useRendererState";

interface GlobalRotationGizmoProps {
  className?: string;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

function parseHSL(str: string): HSL {
  const regex = /hsl\(\s*([\d.]+)[ ,]+([\d.]+)%[ ,]+([\d.]+)%\s*\)/;
  const match = str.match(regex);
  return match
    ? {
        h: parseFloat(match[1]),
        s: parseFloat(match[2]),
        l: parseFloat(match[3]),
      }
    : { h: 0, s: 0, l: 0 };
}

function hslToString({ h, s, l }: HSL): string {
  return `hsl(${h} ${s}% ${l}%)`;
}

function lightenColor(color: string, amount: number): string {
  const { h, s, l } = parseHSL(color);
  return hslToString({ h, s, l: Math.min(100, l + amount) });
}

function adjustColorForDepth(
  baseHSL: string,
  depth: number,
  minDepth: number,
  maxDepth: number,
): string {
  const base = parseHSL(baseHSL);
  const t = (depth - minDepth) / (maxDepth - minDepth || 1);
  let newL = base.l - t * 20;
  if (newL < 0) newL = 0;
  return hslToString({ h: base.h, s: base.s, l: newL });
}

function secondaryColorForDepth(
  baseHSL: string,
  depth: number,
  minDepth: number,
  maxDepth: number,
): string {
  const base = parseHSL(baseHSL);
  const secondaryL = Math.min(100, base.l + 14);
  const t = (depth - minDepth) / (maxDepth - minDepth || 1);
  let newL = secondaryL - t * 20;
  if (newL < 0) newL = 0;
  return hslToString({ h: base.h, s: base.s, l: newL });
}

function adjustHoverColor(
  baseHSL: string,
  depth: number,
  minDepth: number,
  maxDepth: number,
): string {
  const color = adjustColorForDepth(baseHSL, depth, minDepth, maxDepth);
  const parsed = parseHSL(color);
  const newL = Math.min(100, parsed.l + 10);
  return hslToString({ h: parsed.h, s: parsed.s, l: newL });
}

type AxisName = "X" | "Y" | "Z";

type TargetRotations = {
  [key in AxisName]: {
    positive: [number, number];
    negative: [number, number];
  };
};

type CircleElement = {
  type: "circle";
  subtype: "positive" | "negative";
  center: [number, number];
  depth: number;
  baseHSL: string;
  axisName: string;
  label?: string;
};

type LineElement = {
  type: "line";
  start: [number, number];
  end: [number, number];
  depth: number;
  baseHSL: string;
};
const GIZMO_DPR =
  typeof window !== "undefined"
    ? window.devicePixelRatio
      ? window.devicePixelRatio
      : 1
    : 1;

type Element = LineElement | CircleElement;

const GlobalRotationGizmo: React.FC<GlobalRotationGizmoProps> = ({
  className,
}) => {
  // Use Zustand store with selective subscriptions for optimal performance
  const cameraPhi = useRendererStore((state) => state.values.cameraPhi);
  const cameraTheta = useRendererStore((state) => state.values.cameraTheta);
  const handleChange = useRendererStore((state) => state.handleChange);
  
  const rotation: [number, number, number] = [cameraPhi, cameraTheta, 0];
  const onRotationChange = useCallback(
    (rotation: [number, number, number]) => {
      handleChange("cameraPhi", rotation[0]);
      handleChange("cameraTheta", rotation[1]);
    },
    [handleChange],
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  const lastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const elementsRef = useRef<Element[]>([]);
  const hoveredEndpointRef = useRef<{
    axisName: string;
    subtype: "positive" | "negative";
  } | null>(null);

  const CIRCLE_RADIUS = 10;
  const TEXT_SIZE = CIRCLE_RADIUS;

  const targetRotations: TargetRotations = {
    X: { positive: [0, Math.PI / 2], negative: [0, -Math.PI / 2] },
    Y: { positive: [0, Math.PI], negative: [0, 0] },
    Z: { positive: [Math.PI / 2, 0], negative: [-Math.PI / 2, 0] },
  };

  const equalRotation = (a: [number, number], b: [number, number]) =>
    a[0] === b[0] && a[1] === b[1];

  const axes = useMemo(
    () => [
      {
        name: "X",
        vec: [-1, 0, 0] as [number, number, number],
        color: "hsl(343.9 100% 46%)",
      },
      {
        name: "Y",
        color: "hsl(142.31 100% 33%)",
        vec: [0, 0, 1] as [number, number, number],
      },
      {
        name: "Z",
        vec: [0, 1, 0] as [number, number, number],
        color: "hsl(221.34 97% 54%)",
      },
    ],
    [],
  );

  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const isFineGrained = useMediaQuery("(pointer: fine)");

  const rotMat = useMemo(
    () => rotateM33(rotation[0], rotation[1], rotation[2]),
    [rotation],
  );

  const updateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    canvas.width = width * GIZMO_DPR;
    canvas.height = height * GIZMO_DPR;
    ctx.scale(GIZMO_DPR, GIZMO_DPR);
    canvas.style.clipPath = `circle(${
      Math.min(width, height) / 2
    }px at 50% 50%)`;

    const projectOrthogonal = (v: [number, number, number]) => ({
      screen: [v[0], v[1]] as [number, number],
      depth: 3 - v[2],
    });
    let maxProjRadius = 0;

    const axisData: {
      axis: (typeof axes)[number];
      pos3d: [number, number, number];
      neg3d: [number, number, number];
      projPos: { screen: [number, number]; depth: number };
      projNeg: { screen: [number, number]; depth: number };
    }[] = [];
    axes.forEach((axis) => {
      const vPos = multiplyM3V3(rotMat, axis.vec);
      const vNeg: [number, number, number] = [-vPos[0], -vPos[1], -vPos[2]];
      const projPos = projectOrthogonal(vPos);
      const projNeg = projectOrthogonal(vNeg);
      const r = Math.hypot(projPos.screen[0], projPos.screen[1]);
      if (r > maxProjRadius) maxProjRadius = r;
      axisData.push({ axis, pos3d: vPos, neg3d: vNeg, projPos, projNeg });
    });
    const desiredRadius = Math.min(width, height) * 0.35;
    const scale = maxProjRadius > 0 ? desiredRadius / maxProjRadius : 1;
    const cx = width / 2;
    const cy = height / 2;
    const centerProj = projectOrthogonal([0, 0, 0]);
    const centerScreen: [number, number] = [
      cx + centerProj.screen[0] * scale,
      cy - centerProj.screen[1] * scale,
    ];
    const elements: Element[] = [];
    axisData.forEach((data) => {
      const posScreen: [number, number] = [
        cx + data.projPos.screen[0] * scale,
        cy - data.projPos.screen[1] * scale,
      ];
      const negScreen: [number, number] = [
        cx + data.projNeg.screen[0] * scale,
        cy - data.projNeg.screen[1] * scale,
      ];
      const depthPos = data.projPos.depth;
      const depthNeg = data.projNeg.depth;
      const lineDepth = (centerProj.depth + depthPos) / 2;
      const dx = posScreen[0] - centerScreen[0];
      const dy = posScreen[1] - centerScreen[1];
      const dist = Math.hypot(dx, dy);
      const t = dist > CIRCLE_RADIUS ? (dist - CIRCLE_RADIUS) / dist : 0;
      const adjustedPos: [number, number] = [
        centerScreen[0] + dx * t,
        centerScreen[1] + dy * t,
      ];
      elements.push({
        type: "line",
        start: centerScreen,
        end: adjustedPos,
        depth: lineDepth,
        baseHSL: data.axis.color,
      });
      elements.push({
        type: "circle",
        subtype: "positive",
        center: posScreen,
        depth: depthPos,
        baseHSL: data.axis.color,
        axisName: data.axis.name,
        label: data.axis.name,
      });
      elements.push({
        type: "circle",
        subtype: "negative",
        center: negScreen,
        depth: depthNeg,
        baseHSL: data.axis.color,
        axisName: data.axis.name,
      });
    });
    elementsRef.current = elements;
    const depths = elements.map((el) => el.depth);
    const minDepth = Math.min(...depths);
    const maxDepth = Math.max(...depths);
    ctx.clearRect(0, 0, width, height);
    const sorted = [...elements].sort((a, b) => {
      const depthDiff = b.depth - a.depth;
      if (Math.abs(depthDiff) < 0.001)
        return a.type === b.type ? 0 : a.type === "line" ? -1 : 1;
      return depthDiff;
    });
    const offset = 10;
    sorted.forEach((el) => {
      if (el.type === "line") {
        let lineColor = adjustColorForDepth(
          el.baseHSL,
          el.depth,
          minDepth,
          maxDepth,
        );
        if (!isDarkMode) lineColor = lightenColor(lineColor, offset);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(el.start[0], el.start[1]);
        ctx.lineTo(el.end[0], el.end[1]);
        ctx.stroke();
      } else {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(el.center[0], el.center[1], CIRCLE_RADIUS, 0, Math.PI * 2);
        if (el.subtype === "positive") {
          let fillColor =
            hoveredEndpointRef.current &&
            hoveredEndpointRef.current.axisName === el.axisName &&
            hoveredEndpointRef.current.subtype === el.subtype
              ? adjustHoverColor(el.baseHSL, el.depth, minDepth, maxDepth)
              : adjustColorForDepth(el.baseHSL, el.depth, minDepth, maxDepth);
          if (!isDarkMode) fillColor = lightenColor(fillColor, offset);
          ctx.fillStyle = fillColor;
          ctx.strokeStyle = fillColor;
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#000";
          ctx.font = `${TEXT_SIZE}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          if (el.label) ctx.fillText(el.label, el.center[0], el.center[1]);
        } else {
          let fillColor =
            hoveredEndpointRef.current &&
            hoveredEndpointRef.current.axisName === el.axisName &&
            hoveredEndpointRef.current.subtype === el.subtype
              ? adjustHoverColor(el.baseHSL, el.depth, minDepth, maxDepth)
              : secondaryColorForDepth(
                  el.baseHSL,
                  el.depth,
                  minDepth,
                  maxDepth,
                );
          let borderColor = adjustColorForDepth(
            el.baseHSL,
            el.depth,
            minDepth,
            maxDepth,
          );
          if (!isDarkMode) {
            fillColor = lightenColor(fillColor, offset);
            borderColor = lightenColor(borderColor, offset);
          }
          ctx.fillStyle = fillColor;
          ctx.fill();
          ctx.strokeStyle = borderColor;
          ctx.stroke();
        }
      }
    });
  }, [rotation, axes, isDarkMode, rotMat]);

  const frameRef = useRef<number | null>(null);
  const scheduleUpdate = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      updateCanvas();
      frameRef.current = null;
    });
  }, [updateCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => scheduleUpdate();
    window.addEventListener("resize", resize);
    scheduleUpdate();
    return () => window.removeEventListener("resize", resize);
  }, [scheduleUpdate]);

  useEffect(() => {
    scheduleUpdate();
  }, [rotation, scheduleUpdate]);

  const getPos = (e: MouseEvent | TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return {
      x: (e as MouseEvent).clientX - rect.left,
      y: (e as MouseEvent).clientY - rect.top,
    };
  };

  const isInsideCircle = (
    pos: { x: number; y: number },
    canvas: HTMLCanvasElement,
  ) => {
    const canvasWidth = canvas.width / GIZMO_DPR;
    const canvasHeight = canvas.height / GIZMO_DPR;
    const center = { x: canvasWidth / 2, y: canvasHeight / 2 };
    const radius = Math.min(canvasWidth, canvasHeight) / 2;
    const res = Math.hypot(pos.x - center.x, pos.y - center.y) <= radius;
    return res;
  };

  const handleClick = (pos: { x: number; y: number }) => {
    const endpoints = elementsRef.current.filter(
      (el: Element) => el.type === "circle",
    ) as CircleElement[];
    endpoints.sort((a: CircleElement, b: CircleElement) => a.depth - b.depth);
    for (const el of endpoints) {
      const dx = pos.x - el.center[0],
        dy = pos.y - el.center[1];
      if (Math.hypot(dx, dy) <= CIRCLE_RADIUS) {
        if (targetRotations[el.axisName as AxisName]) {
          const clickedRot =
            targetRotations[el.axisName as AxisName][el.subtype];
          const newRot = !equalRotation([rotation[0], rotation[1]], clickedRot)
            ? targetRotations[el.axisName as AxisName][
                el.subtype === "positive" ? "negative" : "positive"
              ]
            : clickedRot;
          onRotationChange([newRot[0], newRot[1], 0]);
          return;
        }
      }
    }

    onRotationChange([rotation[0], rotation[1], 0]);
  };

  const s = 0.005;

  // Add a flag to track if significant movement occurred during dragging
  const hasMoved = useRef(false);

  const onStart = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e);
    if (!isInsideCircle(pos, canvas)) return;
    if (isFineGrained && e instanceof MouseEvent && canvas.requestPointerLock) {
      canvas.requestPointerLock();
    }

    dragging.current = true;
    hasMoved.current = false; // Reset movement tracking on start
    lastPos.current = pos;
    startPosRef.current = pos;
    canvas.style.cursor = "grabbing";
  };

  const onMove = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (dragging.current) {
      if (document.pointerLockElement === canvas && e instanceof MouseEvent) {
        const dx = e.movementX,
          dy = e.movementY;

        // Track if significant movement has occurred
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          hasMoved.current = true;
        }

        onRotationChange([
          rotation[0] - dy * s,
          rotation[1] - dx * s,
          rotation[2],
        ]);
        return;
      }
      e.preventDefault();
      const posNow = getPos(e);
      const dx = posNow.x - lastPos.current.x;
      const dy = posNow.y - lastPos.current.y;

      // Track if significant movement has occurred
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved.current = true;
      }

      lastPos.current = posNow;
      onRotationChange([
        rotation[0] - dy * s,
        rotation[1] - dx * s,
        rotation[2],
      ]);
    } else {
      const center = { x: canvas.width / 2, y: canvas.height / 2 };
      if (
        Math.hypot(getPos(e).x - center.x, getPos(e).y - center.y) >
        Math.min(canvas.width, canvas.height) / 2
      ) {
        canvas.style.cursor = "default";
        hoveredEndpointRef.current = null;
        scheduleUpdate();
        return;
      }
      let hit: { axisName: string; subtype: "positive" | "negative" } | null =
        null;
      const endpoints = elementsRef.current.filter(
        (el: Element) => el.type === "circle",
      ) as CircleElement[];
      endpoints.sort((a: CircleElement, b: CircleElement) => a.depth - b.depth);
      const pos = getPos(e);
      for (const el of endpoints) {
        const dx = pos.x - el.center[0],
          dy = pos.y - el.center[1];
        if (Math.hypot(dx, dy) <= CIRCLE_RADIUS) {
          hit = { axisName: el.axisName, subtype: el.subtype };
          break;
        }
      }
      if (hit) {
        hoveredEndpointRef.current = hit;
        canvas.style.cursor = "pointer";
      } else {
        hoveredEndpointRef.current = null;
        canvas.style.cursor = "grab";
      }
      scheduleUpdate();
    }
  };

  const onEnd = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (!isFineGrained) {
        return;
      }

      canvas.style.cursor = "grab";
      const pos = getPos(e);

      // Only treat as a click if no significant movement occurred during drag
      if (
        !hasMoved.current &&
        Math.hypot(
          pos.x - startPosRef.current.x,
          pos.y - startPosRef.current.y,
        ) < 5 &&
        dragging.current
      ) {
        handleClick(pos);
      }
      if (document.pointerLockElement === canvas && document.exitPointerLock) {
        document.exitPointerLock();
      }
      dragging.current = false;
    },
    [handleClick, isFineGrained],
  );

  // Attach additional canvas events for mouseleave
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onMouseLeave = () => {
      hoveredEndpointRef.current = null;
      canvas.style.cursor = "grab";
      scheduleUpdate();
    };
    canvas.addEventListener("mouseleave", onMouseLeave);
    return () => {
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [scheduleUpdate]);

  // Changed: All mouse/touch events are now attached to the canvas element.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("mousedown", onStart);
    canvas.addEventListener("touchstart", onStart, { passive: false });
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("mouseup", onEnd);
    canvas.addEventListener("touchend", onEnd);
    canvas.addEventListener("touchcancel", onEnd);
    return () => {
      canvas.removeEventListener("mousedown", onStart);
      canvas.removeEventListener("touchstart", onStart);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("touchmove", onMove);
      canvas.removeEventListener("mouseup", onEnd);
      canvas.removeEventListener("touchend", onEnd);
      canvas.removeEventListener("touchcancel", onEnd);
    };
  }, [rotation, onRotationChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pointerLockChange = () => {
      if (document.pointerLockElement !== canvas) {
        dragging.current = false;
        canvas.style.cursor = "grab";
      }
    };
    document.addEventListener("pointerlockchange", pointerLockChange);
    return () =>
      document.removeEventListener("pointerlockchange", pointerLockChange);
  }, []);

  return (
    <div
      className={clsx(
        "rounded-ful overflow-hiddenl pointer-events-none",
        className,
      )}
    >
      <div
        className={
          "w-24 h-24 rounded-full dark:bg-slate-700/50 dark:hover:bg-slate-700/60 bg-slate-200/50 hover:bg-slate-200/60 pointer-events-auto"
        }
      >
        <canvas ref={canvasRef} className="w-full h-full select-none" />
      </div>
    </div>
  );
};

export default React.memo(GlobalRotationGizmo);
