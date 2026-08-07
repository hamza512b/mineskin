"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  MinusIcon,
  PlusIcon,
  ResetIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useDictionary } from "@/i18n";
import { cn } from "@/lib/utils";
import useIsTouch from "@/hooks/useIsTouch";
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
/** Breathing room kept between the loupe and the top of the window. */
const LOUPE_SCREEN_MARGIN = 8;
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

/**
 * Travel that turns a zoomed press into a pan rather than a pick. Generous
 * enough that a finger resting on a pixel still picks, tight enough that a
 * deliberate drag is felt as movement straight away.
 */
const DRAG_SLOP = 8;
/** How long the "drag to move" pill stays up, if no pan happens first. */
const PAN_HINT_MS = 5000;

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
  /**
   * Removes the reference on screen. Optional because the surface that has a
   * hover affordance on the thumbnail itself doesn't need a second one here;
   * pass it and a trash button joins the control column.
   */
  onRemove?: () => void;
  className?: string;
}

/**
 * The picking surface.
 *
 * Picking is modeless — there's no arming step to discover or forget. At fit
 * size a press is always a pick: drag to aim, release to commit. Zoomed in,
 * where the image no longer fits and moving it is the common need, a drag past
 * DRAG_SLOP becomes a pan and a press that stays put is still the pick. That
 * split costs nothing at 1x (there's nowhere to pan to) and nothing zoomed
 * either: magnified pixels are large enough to hit without dragging to aim.
 *
 * Two fingers always pinch and pan, and ctrl/cmd + drag always pans, so the
 * habit that worked before this still works. On a pointer device the wheel
 * pans — shift for sideways, since a wheel mouse has no horizontal axis — and
 * a pinch (which arrives as ctrl+wheel) zooms, the same contract maps use.
 *
 * Colors are read from the decoded source at full resolution, never from the
 * scaled canvas: the browser interpolates when it downscales, so sampling what
 * you see would return colors that aren't in the image.
 */
const ReferenceViewport: React.FC<ReferenceViewportProps> = ({
  entry,
  onPick,
  onRemove,
  className,
}) => {
  const { dictionary: dict } = useDictionary();
  // Only picks the hint's wording — the gestures themselves are the same on
  // both, so nothing behavioural hangs off this.
  const isTouch = useIsTouch();
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
  // Drives the grabbing cursor. Only a mouse can see it, but it's set for every
  // pointer type since the alternative is branching on input in the handlers.
  const [panning, setPanning] = useState(false);

  // The pill that says the image can be dragged. It's shown on the zoom that
  // makes panning possible and retired the moment the user pans by any means —
  // a hint that outlives being acted on is just clutter.
  const [panHint, setPanHint] = useState(false);
  const panHintDoneRef = useRef(false);
  const markPanned = useCallback(() => {
    if (panHintDoneRef.current) return;
    panHintDoneRef.current = true;
    setPanHint(false);
  }, []);

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
    // A new image is a new view to learn your way around, so the hint is owed
    // again even if it was dismissed on the last one.
    panHintDoneRef.current = false;

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

  // Crossing out of fit size is the moment panning becomes possible and the
  // drag gesture changes meaning, so that's when the pill is worth showing.
  // Deps are the boolean, not `zoom`, so stepping 1.4x → 1.8x doesn't restart
  // the timer under someone who is already reading it.
  const zoomed = zoom > 1;
  useEffect(() => {
    if (!zoomed || panHintDoneRef.current) {
      setPanHint(false);
      return;
    }
    setPanHint(true);
    const timer = window.setTimeout(() => setPanHint(false), PAN_HINT_MS);
    return () => window.clearTimeout(timer);
  }, [zoomed]);

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
        let { deltaX, deltaY } = e;
        // A wheel mouse has no horizontal axis, so shift is the long-standing
        // stand-in for one. Some browsers already report it as deltaX, others
        // leave it on deltaY with the modifier set — hence the guard, which
        // rotates only the ones that didn't do it themselves.
        if (e.shiftKey && deltaX === 0) {
          deltaX = deltaY;
          deltaY = 0;
        }
        const t = transformRef.current;
        applyTransform({ panX: t.panX - deltaX, panY: t.panY - deltaY });
        markPanned();
      }
    };
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [zoomAt, applyTransform, markPanned]);

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
  // Where a zoomed press landed, held until the gesture reveals itself: stay
  // inside DRAG_SLOP and it's a pick, leave it and the press becomes a pan.
  // Null at fit size, where there's nothing to pan and a drag aims as before.
  const tapOriginRef = useRef<{ x: number; y: number } | null>(null);

  /** Hand the gesture over to panning, dropping the pick it started as. */
  const beginPanDrag = useCallback(
    (from: { x: number; y: number }) => {
      tapOriginRef.current = null;
      cancelLoupeHold();
      pickAbortedRef.current = true;
      setLoupe(null);
      setPanning(true);
      panDragRef.current = from;
      markPanned();
    },
    [cancelLoupeHold, markPanned],
  );

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
      beginPanDrag({ x: e.clientX, y: e.clientY });
      return;
    }
    // Zoomed, this press is still undecided — the loupe comes up as usual, and
    // moving past the slop below hands it to the pan instead.
    tapOriginRef.current =
      transformRef.current.zoom > 1 ? { x: e.clientX, y: e.clientY } : null;
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

    // Resolve an undecided zoomed press before anything else reads the gesture.
    // The pan starts from where the finger landed, not from here, so the travel
    // that proved it was a drag isn't thrown away — the image keeps up with the
    // finger instead of lurching after it.
    const tapOrigin = tapOriginRef.current;
    if (
      tapOrigin &&
      e.isPrimary &&
      pointersRef.current.size === 1 &&
      !pickAbortedRef.current &&
      Math.hypot(e.clientX - tapOrigin.x, e.clientY - tapOrigin.y) > DRAG_SLOP
    ) {
      beginPanDrag(tapOrigin);
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
        markPanned();
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
    tapOriginRef.current = null;
    setPanning(false);
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

  /**
   * Where the loupe sits, in container coordinates.
   *
   * Sideways it stays inside the image, so it never hangs over the panel's
   * edge. Upward it is free to leave the viewport entirely: near the top edge
   * there isn't room for it, and pinning it to the edge parks it right on top
   * of the pixel being picked — the one thing it exists to show. What it
   * overlaps up there is the filmstrip, and covering a thumbnail for the
   * length of a press is the cheaper trade. The window edge is the only hard
   * stop.
   */
  const container = containerRef.current;
  const loupePlacement =
    loupe && container
      ? {
          left: Math.max(
            0,
            Math.min(container.clientWidth - LOUPE_SIZE, loupe.x - LOUPE_SIZE / 2),
          ),
          top: Math.max(
            LOUPE_SCREEN_MARGIN - container.getBoundingClientRect().top,
            loupe.y - LOUPE_SIZE - LOUPE_OFFSET,
          ),
        }
      : null;

  return (
    <div
      ref={containerRef}
      // Marks this subtree as owning its drags, so the mobile sheet's
      // capture-phase gesture handler doesn't also read a pick as a pull.
      data-reference-viewport=""
      // No overflow clip here: the loupe is a child and has to be able to rise
      // out of the top of the viewport. The image gets its own clipping wrapper
      // below instead.
      className={cn(
        "relative w-full rounded-lg bg-neutral-200 dark:bg-neutral-900",
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
      {/* Rounds the image off and keeps a zoomed, panned canvas inside the
          panel — the job the container's own overflow used to do. */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <canvas
          ref={canvasRef}
          // Zoomed, the cursor stays a crosshair at rest: a click is still a
          // pick, and the pan only exists once the drag has proven itself.
          // Grabbing shows up when it does, and the modifier advertises itself
          // on hover because there the pan is decided before the drag starts.
          className={cn(
            "block h-full w-full",
            panning
              ? "cursor-grabbing"
              : panModifier
                ? "cursor-grab active:cursor-grabbing"
                : "cursor-crosshair",
          )}
          role="img"
          aria-label={
            zoomed
              ? dict.reference.pickFromImageZoomed
              : dict.reference.pickFromImage
          }
        />
      </div>

      {(loading || failed) && (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
          {failed ? dict.reference.loadFailed : dict.reference.loading}
        </div>
      )}

      {/* Remove keeps its slot even when the image never decoded — a reference
          that fails to load is the one you most want to get rid of — so the
          column outlives the zoom controls it usually holds. */}
      {((!loading && !failed) || onRemove) && (
        <div className="absolute end-1.5 top-1.5 z-10 flex flex-col gap-1 pointer-coarse:end-2 pointer-coarse:top-2 pointer-coarse:gap-1.5">
          {!loading && !failed && (
            <>
              <ControlButton
                label={dict.reference.zoomIn}
                onClick={() => zoomByStep(ZOOM_STEP)}
                disabled={zoom >= MAX_ZOOM}
              >
                <PlusIcon className="h-3.5 w-3.5 pointer-coarse:h-5 pointer-coarse:w-5" />
              </ControlButton>
              <ControlButton
                label={dict.reference.zoomOut}
                onClick={() => zoomByStep(1 / ZOOM_STEP)}
                disabled={zoom <= MIN_ZOOM}
              >
                <MinusIcon className="h-3.5 w-3.5 pointer-coarse:h-5 pointer-coarse:w-5" />
              </ControlButton>
              {/* Held even at 1x, where it does nothing: appearing only once
                  zoomed shifted the trash under it down a slot mid-gesture,
                  so a finger already reaching for one button landed on the
                  other. */}
              <ControlButton
                label={dict.reference.resetZoom}
                onClick={resetTransform}
                disabled={!zoomed}
              >
                <ResetIcon className="h-3.5 w-3.5 pointer-coarse:h-5 pointer-coarse:w-5" />
              </ControlButton>
            </>
          )}
          {onRemove && (
            // Last in the column and the only red one: it neighbours three
            // controls that only change the view, and this one destroys
            // something.
            <ControlButton
              label={dict.reference.remove}
              onClick={onRemove}
              className="mt-1 text-red-400 hover:bg-red-600/80 hover:text-white pointer-coarse:mt-1.5"
            >
              <TrashIcon className="h-3.5 w-3.5 pointer-coarse:h-5 pointer-coarse:w-5" />
            </ControlButton>
          )}
        </div>
      )}

      {loupe && loupePlacement && (
        <div
          aria-hidden
          className="pointer-events-none absolute z-20 overflow-hidden rounded-full border-2 border-white shadow-lg"
          style={{
            width: LOUPE_SIZE,
            height: LOUPE_SIZE,
            ...loupePlacement,
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

      {/* Top-start, the one corner nothing else claims: the controls sit at the
          top end, the zoom badge and hex readout along the bottom. Unlike those
          it survives the loupe being up — on a mouse the loupe is showing
          whenever the cursor is over the image, which is exactly when this
          needs to be readable. */}
      {panHint && (
        <div className="pointer-events-none absolute start-2 top-2 z-10 max-w-[70%] rounded-md bg-black/60 px-2 py-1 text-[10px] leading-tight text-white">
          {isTouch ? dict.reference.panHintTouch : dict.reference.panHintMouse}
        </div>
      )}
    </div>
  );
};

const ControlButton: React.FC<{
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ label, onClick, disabled, className, children }) => (
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
    className={cn(
      "flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-black/45 text-white transition-colors hover:bg-black/65 disabled:opacity-35 pointer-coarse:h-11 pointer-coarse:w-11",
      className,
    )}
  >
    {children}
  </button>
);

export default React.memo(ReferenceViewport);
