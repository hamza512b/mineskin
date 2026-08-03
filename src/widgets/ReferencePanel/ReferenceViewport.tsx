"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MinusIcon, PlusIcon, ResetIcon } from "@radix-ui/react-icons";
import { useDictionary } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  loadReferenceSource,
  samplePixel,
  type ReferenceSource,
} from "@/lib/referenceImage";
import type { ReferenceEntry } from "@/store/referenceStore";

/** Loupe diameter in CSS px. Big enough to clear a fingertip. */
const LOUPE_SIZE = 92;
/** How many screen pixels one source pixel occupies inside the loupe. */
const LOUPE_ZOOM = 10;
/** Gap between the touch point and the loupe's bottom edge. */
const LOUPE_OFFSET = 26;
/**
 * How long a touch waits before the loupe appears. The two fingers of a pinch
 * never land on the same frame, so the first one is indistinguishable from the
 * start of a pick; showing the loupe right away flashes it at the top of every
 * pinch. Sampling still starts immediately — only the display waits.
 */
const LOUPE_TOUCH_DELAY = 90;

const MIN_ZOOM = 1;
const MAX_ZOOM = 16;
const ZOOM_STEP = 1.35;

const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

interface Transform {
  zoom: number;
  panX: number;
  panY: number;
}
const IDENTITY: Transform = { zoom: 1, panX: 0, panY: 0 };

interface ReferenceViewportProps {
  entry: ReferenceEntry;
  onPick: (hex: string) => void;
  className?: string;
}

/**
 * The picking surface.
 *
 * Picking is modeless — while this is on screen a press is always a pick, so
 * there's no arming step to discover or forget. Zoom stays out of its way by
 * splitting on finger count: one finger picks, two fingers pinch and pan. On a
 * pointer device the wheel pans and a pinch (which arrives as ctrl+wheel)
 * zooms, the same contract maps use.
 *
 * Colors are read from the decoded source at full resolution, never from the
 * scaled canvas: the browser interpolates when it downscales, so sampling what
 * you see would return colors that aren't in the image.
 */
const ReferenceViewport: React.FC<ReferenceViewportProps> = ({
  entry,
  onPick,
  className,
}) => {
  const { dictionary: dict } = useDictionary();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<ReferenceSource | null>(null);

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);

  // The view transform is read inside pointer maths every frame, so it lives in
  // a ref; `zoom` mirrors it purely so the controls can re-render.
  const transformRef = useRef<Transform>({ ...IDENTITY });
  // Where the image sits inside the canvas, in CSS px, after fit + transform.
  const layoutRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 });
  const [loupe, setLoupe] = useState<{
    x: number;
    y: number;
    hex: string;
  } | null>(null);

  /** Resolve fit + transform into the draw rect, clamping pan to keep the
   *  image from being pushed entirely out of view. */
  const computeLayout = useCallback((viewW: number, viewH: number) => {
    const source = sourceRef.current;
    if (!source) return null;
    const fit = Math.min(viewW / source.width, viewH / source.height);
    const t = transformRef.current;
    const scale = fit * t.zoom;
    const drawW = source.width * scale;
    const drawH = source.height * scale;

    // Allow panning only as far as the overflow in each axis; when the image
    // is smaller than the view on an axis it stays centered there.
    const slackX = Math.max(0, (drawW - viewW) / 2);
    const slackY = Math.max(0, (drawH - viewH) / 2);
    t.panX = Math.min(slackX, Math.max(-slackX, t.panX));
    t.panY = Math.min(slackY, Math.max(-slackY, t.panY));

    return {
      scale,
      drawW,
      drawH,
      offsetX: (viewW - drawW) / 2 + t.panX,
      offsetY: (viewH - drawH) / 2 + t.panY,
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const source = sourceRef.current;
    if (!canvas || !container || !source) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const layout = computeLayout(rect.width, rect.height);
    if (!layout) return;
    layoutRef.current = layout;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    // Past 1:1 the user is inspecting individual pixels, so stop smoothing and
    // show them as squares rather than a blur.
    ctx.imageSmoothingEnabled = layout.scale < 1;
    ctx.drawImage(
      source.canvas,
      layout.offsetX,
      layout.offsetY,
      layout.drawW,
      layout.drawH,
    );
  }, [computeLayout]);

  const applyTransform = useCallback(
    (next: Partial<Transform>) => {
      const t = transformRef.current;
      transformRef.current = { ...t, ...next };
      setZoom(transformRef.current.zoom);
      draw();
    },
    [draw],
  );

  const resetTransform = useCallback(() => {
    transformRef.current = { ...IDENTITY };
    setZoom(1);
    // The magnifier pointed at a spot in the old view; after the transform
    // moves it's aimed at the wrong pixel, so drop it.
    setLoupe(null);
    draw();
  }, [draw]);

  /** Zoom about a fixed point in container coordinates, so whatever is under
   *  the cursor or pinch center stays put. */
  const zoomAt = useCallback(
    (nextZoom: number, anchorX: number, anchorY: number) => {
      const container = containerRef.current;
      const source = sourceRef.current;
      if (!container || !source) return;
      const rect = container.getBoundingClientRect();
      const t = transformRef.current;
      const target = clampZoom(nextZoom);
      // A two-finger drag with no spread still moved the pan, so flush and
      // redraw rather than bailing out and dropping it.
      if (target === t.zoom) {
        applyTransform({});
        return;
      }

      const fit = Math.min(rect.width / source.width, rect.height / source.height);
      const scale = fit * t.zoom;
      const offsetX = (rect.width - source.width * scale) / 2 + t.panX;
      const offsetY = (rect.height - source.height * scale) / 2 + t.panY;
      // The image-space point under the anchor, which must not move.
      const imgX = (anchorX - offsetX) / scale;
      const imgY = (anchorY - offsetY) / scale;

      const nextScale = fit * target;
      applyTransform({
        zoom: target,
        panX: anchorX - imgX * nextScale - (rect.width - source.width * nextScale) / 2,
        panY:
          anchorY - imgY * nextScale - (rect.height - source.height * nextScale) / 2,
      });
    },
    [applyTransform],
  );

  const zoomByStep = useCallback(
    (factor: number) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      setLoupe(null);
      // Buttons zoom about the middle; there's no cursor to anchor to.
      zoomAt(transformRef.current.zoom * factor, rect.width / 2, rect.height / 2);
    },
    [zoomAt],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setLoupe(null);
    sourceRef.current = null;
    transformRef.current = { ...IDENTITY };
    setZoom(1);

    loadReferenceSource(entry.blob)
      .then((source) => {
        if (cancelled) return;
        sourceRef.current = source;
        setLoading(false);
        draw();
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
        setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [entry.id, entry.blob, draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => draw());
    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  // Wheel is bound natively (not via React) because it must be non-passive to
  // preventDefault, which stops trackpad pinch from zooming the whole page.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (e: WheelEvent) => {
      if (!sourceRef.current) return;
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      // Browsers report trackpad pinch as a ctrl-modified wheel event.
      if (e.ctrlKey || e.metaKey) {
        zoomAt(
          transformRef.current.zoom * Math.exp(-e.deltaY / 180),
          e.clientX - rect.left,
          e.clientY - rect.top,
        );
      } else {
        const t = transformRef.current;
        applyTransform({ panX: t.panX - e.deltaX, panY: t.panY - e.deltaY });
      }
    };
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [zoomAt, applyTransform]);

  /** Map a client point onto source pixels, or null when outside the image. */
  const toSourcePoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return null;
    const rect = canvas.getBoundingClientRect();
    const { scale, offsetX, offsetY } = layoutRef.current;
    const x = (clientX - rect.left - offsetX) / scale;
    const y = (clientY - rect.top - offsetY) / scale;
    if (x < 0 || y < 0 || x >= source.width || y >= source.height) return null;
    return { x, y, localX: clientX - rect.left, localY: clientY - rect.top };
  }, []);

  const drawLoupe = useCallback((sourceX: number, sourceY: number) => {
    const loupeCanvas = loupeCanvasRef.current;
    const source = sourceRef.current;
    if (!loupeCanvas || !source) return;
    const dpr = window.devicePixelRatio || 1;
    loupeCanvas.width = Math.round(LOUPE_SIZE * dpr);
    loupeCanvas.height = Math.round(LOUPE_SIZE * dpr);
    const ctx = loupeCanvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Nearest-neighbour so magnified pixels stay square and readable —
    // smoothing here would blur the very edges the user is aiming at.
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, LOUPE_SIZE, LOUPE_SIZE);

    const span = LOUPE_SIZE / LOUPE_ZOOM;
    ctx.drawImage(
      source.canvas,
      Math.floor(sourceX) - span / 2,
      Math.floor(sourceY) - span / 2,
      span,
      span,
      0,
      0,
      LOUPE_SIZE,
      LOUPE_SIZE,
    );

    const center = LOUPE_SIZE / 2;
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(
      center - LOUPE_ZOOM / 2,
      center - LOUPE_ZOOM / 2,
      LOUPE_ZOOM,
      LOUPE_ZOOM,
    );
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      center - LOUPE_ZOOM / 2 - 1,
      center - LOUPE_ZOOM / 2 - 1,
      LOUPE_ZOOM + 2,
      LOUPE_ZOOM + 2,
    );
  }, []);

  // While held, sampling continues but the loupe stays hidden — see
  // LOUPE_TOUCH_DELAY.
  const loupeHoldRef = useRef(false);
  const loupeTimerRef = useRef<number | null>(null);
  // Last sampled point, so the delayed reveal can draw where the finger is now
  // rather than where it landed.
  const lastSampleRef = useRef<{ x: number; y: number } | null>(null);

  const trackPointer = useCallback(
    (clientX: number, clientY: number) => {
      lastSampleRef.current = { x: clientX, y: clientY };
      const point = toSourcePoint(clientX, clientY);
      const source = sourceRef.current;
      if (!point || !source) return null;
      const hex = samplePixel(source, point.x, point.y);
      if (!hex) return null;
      if (!loupeHoldRef.current) {
        setLoupe({ x: point.localX, y: point.localY, hex });
        drawLoupe(point.x, point.y);
      }
      return hex;
    },
    [toSourcePoint, drawLoupe],
  );

  const cancelLoupeHold = useCallback(() => {
    if (loupeTimerRef.current !== null) {
      window.clearTimeout(loupeTimerRef.current);
      loupeTimerRef.current = null;
    }
    loupeHoldRef.current = false;
  }, []);

  // A pending reveal outlives the component if the panel closes mid-press.
  useEffect(() => cancelLoupeHold, [cancelLoupeHold]);

  // Active pointers drive the one-finger-picks / two-fingers-transform split.
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ dist: number; cx: number; cy: number } | null>(null);
  // Set when a second finger lands, so lifting back to one finger doesn't
  // resume picking and drop a stray color at the end of a pinch.
  const pickAbortedRef = useRef(false);
  // Ctrl/Cmd + drag pans. A plain drag is a pick, so without a modifier there's
  // no way to move a zoomed image on a pointer device; two-finger pan covers
  // touch. Both keys are accepted since Ctrl is the Windows habit and Cmd the
  // Mac one.
  const panDragRef = useRef<{ x: number; y: number } | null>(null);
  const [panModifier, setPanModifier] = useState(false);

  const isPanModifier = (e: {
    ctrlKey: boolean;
    metaKey: boolean;
  }) => e.ctrlKey || e.metaKey;

  // Track the modifier so the cursor advertises pan mode before the drag
  // starts. Blur resets it, or releasing the key off-window leaves it stuck on.
  useEffect(() => {
    const sync = (e: KeyboardEvent) => setPanModifier(isPanModifier(e));
    const clear = () => setPanModifier(false);
    window.addEventListener("keydown", sync);
    window.addEventListener("keyup", sync);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", sync);
      window.removeEventListener("keyup", sync);
      window.removeEventListener("blur", clear);
    };
  }, []);

  // Holding the modifier means the next drag pans, so the magnifier — which
  // only ever previews a pick — goes away the moment the key goes down, not
  // when the drag starts.
  useEffect(() => {
    if (panModifier) setLoupe(null);
  }, [panModifier]);

  const pinchState = () => {
    const pts = Array.from(pointersRef.current.values());
    if (pts.length < 2) return null;
    const [a, b] = pts;
    return {
      dist: Math.hypot(a.x - b.x, a.y - b.y),
      cx: (a.x + b.x) / 2,
      cy: (a.y + b.y) / 2,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (loading || failed) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size >= 2) {
      // Second finger turns the gesture into a transform. Stop it here too, or
      // the sheet's drag handling would still see it and fight the pinch.
      e.stopPropagation();
      cancelLoupeHold();
      pickAbortedRef.current = true;
      setLoupe(null);
      pinchRef.current = pinchState();
      return;
    }
    if (!e.isPrimary) return;
    cancelLoupeHold();
    pickAbortedRef.current = false;
    // Own the gesture so a drag across the image keeps updating the loupe and
    // isn't stolen by the sheet's own drag handling.
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();

    if (isPanModifier(e)) {
      // Held at press time decides the whole gesture; letting the modifier
      // switch modes mid-drag would strand a half-finished pick or pan.
      panDragRef.current = { x: e.clientX, y: e.clientY };
      pickAbortedRef.current = true;
      setLoupe(null);
      return;
    }
    // A mouse can't grow a second finger, so it previews at once; touch waits
    // out the window in which this press could still turn into a pinch.
    if (e.pointerType !== "mouse") {
      loupeHoldRef.current = true;
      loupeTimerRef.current = window.setTimeout(() => {
        loupeTimerRef.current = null;
        loupeHoldRef.current = false;
        const last = lastSampleRef.current;
        // Only one finger ever landed, so this really was a pick.
        if (!last || pickAbortedRef.current || pointersRef.current.size !== 1) {
          return;
        }
        trackPointer(last.x, last.y);
      }, LOUPE_TOUCH_DELAY);
    }
    trackPointer(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (loading || failed) return;
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    const panDrag = panDragRef.current;
    if (panDrag) {
      e.stopPropagation();
      const t = transformRef.current;
      applyTransform({
        panX: t.panX + (e.clientX - panDrag.x),
        panY: t.panY + (e.clientY - panDrag.y),
      });
      panDragRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (pointersRef.current.size >= 2) {
      const next = pinchState();
      const prev = pinchRef.current;
      if (next && prev) {
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const t = transformRef.current;
          // Pan by the center's travel, then zoom about the new center.
          transformRef.current = {
            ...t,
            panX: t.panX + (next.cx - prev.cx),
            panY: t.panY + (next.cy - prev.cy),
          };
          if (prev.dist > 0) {
            zoomAt(
              transformRef.current.zoom * (next.dist / prev.dist),
              next.cx - rect.left,
              next.cy - rect.top,
            );
          } else {
            applyTransform({});
          }
        }
        pinchRef.current = next;
      }
      return;
    }

    if (pickAbortedRef.current || !e.isPrimary) return;
    // With the modifier down the pointer is a pan tool, so hover must not keep
    // re-showing the magnifier behind the effect that just cleared it.
    if (isPanModifier(e)) {
      setLoupe(null);
      return;
    }
    // A mouse previews on hover; touch has no hover, so it only tracks while
    // held — which is exactly when we hold pointer capture.
    const tracking =
      e.pointerType === "mouse" ||
      e.currentTarget.hasPointerCapture(e.pointerId);
    if (!tracking) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.stopPropagation();
    trackPointer(e.clientX, e.clientY);
  };

  const endPointer = (e: React.PointerEvent<HTMLDivElement>, commit: boolean) => {
    const wasMulti = pointersRef.current.size >= 2;
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    panDragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    // The gesture resolved before the window elapsed; a lift is never a pinch.
    // Releasing the hold here also lets a tap shorter than the delay still show
    // its pick — the state updates batch, so nothing flashes on the way out.
    cancelLoupeHold();

    if (wasMulti || pickAbortedRef.current) {
      // Finished a transform, not a pick. Stay aborted until every finger is
      // up so the last lift can't register as a color.
      if (pointersRef.current.size === 0) pickAbortedRef.current = false;
      setLoupe(null);
      return;
    }
    if (!commit || !e.isPrimary) {
      setLoupe(null);
      return;
    }
    // Commit on release, so a touch can be dragged into place first.
    const hex = trackPointer(e.clientX, e.clientY);
    if (hex) onPick(hex);
    if (e.pointerType !== "mouse") setLoupe(null);
  };

  const zoomed = zoom > 1;

  return (
    <div
      ref={containerRef}
      // Marks this subtree as owning its drags, so the mobile sheet's
      // capture-phase gesture handler doesn't also read a pick as a pull.
      data-reference-viewport=""
      className={cn(
        "relative w-full overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-900",
        className,
      )}
      // touch-none keeps the browser from claiming the drag as a pan or pinch
      // and pointercancelling mid-pick.
      style={{ touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endPointer(e, true)}
      onPointerCancel={(e) => endPointer(e, false)}
      // Ctrl+click raises the context menu on macOS, which would cancel the
      // pan the same modifier just started.
      onContextMenu={(e) => {
        if (isPanModifier(e)) e.preventDefault();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse" && pointersRef.current.size === 0) {
          setLoupe(null);
        }
      }}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "block h-full w-full",
          panModifier ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair",
        )}
        role="img"
        aria-label={dict.reference.pickFromImage}
      />

      {(loading || failed) && (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
          {failed ? dict.reference.loadFailed : dict.reference.loading}
        </div>
      )}

      {!loading && !failed && (
        <div className="absolute end-1.5 top-1.5 z-10 flex flex-col gap-1 pointer-coarse:end-2 pointer-coarse:top-2 pointer-coarse:gap-1.5">
          <ZoomButton
            label={dict.reference.zoomIn}
            onClick={() => zoomByStep(ZOOM_STEP)}
            disabled={zoom >= MAX_ZOOM}
          >
            <PlusIcon className="h-3.5 w-3.5 pointer-coarse:h-5 pointer-coarse:w-5" />
          </ZoomButton>
          <ZoomButton
            label={dict.reference.zoomOut}
            onClick={() => zoomByStep(1 / ZOOM_STEP)}
            disabled={zoom <= MIN_ZOOM}
          >
            <MinusIcon className="h-3.5 w-3.5 pointer-coarse:h-5 pointer-coarse:w-5" />
          </ZoomButton>
          {zoomed && (
            <ZoomButton label={dict.reference.resetZoom} onClick={resetTransform}>
              <ResetIcon className="h-3.5 w-3.5 pointer-coarse:h-5 pointer-coarse:w-5" />
            </ZoomButton>
          )}
        </div>
      )}

      {loupe && (
        <div
          aria-hidden
          className="pointer-events-none absolute z-10 overflow-hidden rounded-full border-2 border-white shadow-lg"
          style={{
            width: LOUPE_SIZE,
            height: LOUPE_SIZE,
            // Clamped so the loupe stays inside the viewport when picking near
            // an edge, and lifted above the finger so it isn't covered.
            left: Math.max(
              0,
              Math.min(
                (containerRef.current?.clientWidth ?? 0) - LOUPE_SIZE,
                loupe.x - LOUPE_SIZE / 2,
              ),
            ),
            top: Math.max(
              0,
              Math.min(
                (containerRef.current?.clientHeight ?? 0) - LOUPE_SIZE,
                loupe.y - LOUPE_SIZE - LOUPE_OFFSET,
              ),
            ),
          }}
        >
          <canvas
            ref={loupeCanvasRef}
            style={{ width: LOUPE_SIZE, height: LOUPE_SIZE }}
          />
        </div>
      )}

      {loupe && (
        <div
          aria-live="polite"
          className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-black/60 px-2 py-1 font-mono text-[11px] text-white"
        >
          {loupe.hex}
        </div>
      )}

      {zoomed && !loupe && (
        <div className="pointer-events-none absolute bottom-2 start-2 rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[10px] text-white">
          {zoom.toFixed(1)}x
        </div>
      )}
    </div>
  );
};

const ZoomButton: React.FC<{
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ label, onClick, disabled, children }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    // The viewport treats presses as picks, so keep this button's own pointer
    // events from reaching it.
    onPointerDown={(e) => e.stopPropagation()}
    onClick={onClick}
    // 24px is a comfortable mouse target but well under the 44px finger
    // minimum, so touch pointers get a bigger tile.
    className="flex h-6 w-6 items-center justify-center rounded-md bg-black/45 text-white transition-colors hover:bg-black/65 disabled:opacity-35 pointer-coarse:h-11 pointer-coarse:w-11"
  >
    {children}
  </button>
);

export default React.memo(ReferenceViewport);
