"use client";
import type { LibraryEntry } from "@/store/libraryStore";
import Dropdown, { DropdownItem, DropdownSeparator } from "@/components/Dropdown";
import { Pencil1Icon, DownloadIcon, TrashIcon, DotsVerticalIcon } from "@radix-ui/react-icons";
import { useRef, useEffect } from "react";
import Button from "@/components/Button";
import { useConfirmation } from "@/widgets/Confirmation/Confirmation";

// --- Skin texture region mapping (matches training/renderer/mesh.py UV layout) ---
// Front face formula: (u0 + d, v0 + d) size (w, h)
// Back face formula:  (u0 + d + w + d, v0 + d) size (w, h)
type Region = { sx: number; sy: number; sw: number; sh: number; dx: number; dy: number };

function getSkinRegions(armW: number) {
  return {
    frontBase: [
      { sx: 8, sy: 8, sw: 8, sh: 8, dx: armW, dy: 0 },           // Head
      { sx: 20, sy: 20, sw: 8, sh: 12, dx: armW, dy: 8 },         // Body
      { sx: 44, sy: 20, sw: armW, sh: 12, dx: 0, dy: 8 },         // Right Arm
      { sx: 36, sy: 52, sw: armW, sh: 12, dx: armW + 8, dy: 8 },  // Left Arm
      { sx: 4, sy: 20, sw: 4, sh: 12, dx: armW, dy: 20 },         // Right Leg
      { sx: 20, sy: 52, sw: 4, sh: 12, dx: armW + 4, dy: 20 },    // Left Leg
    ] as Region[],
    frontOverlay: [
      { sx: 40, sy: 8, sw: 8, sh: 8, dx: armW, dy: 0 },
      { sx: 20, sy: 36, sw: 8, sh: 12, dx: armW, dy: 8 },
      { sx: 44, sy: 36, sw: armW, sh: 12, dx: 0, dy: 8 },
      { sx: 52, sy: 52, sw: armW, sh: 12, dx: armW + 8, dy: 8 },
      { sx: 4, sy: 36, sw: 4, sh: 12, dx: armW, dy: 20 },
      { sx: 4, sy: 52, sw: 4, sh: 12, dx: armW + 4, dy: 20 },
    ] as Region[],
    backBase: [
      { sx: 24, sy: 8, sw: 8, sh: 8, dx: armW, dy: 0 },
      { sx: 32, sy: 20, sw: 8, sh: 12, dx: armW, dy: 8 },
      { sx: 40 + armW, sy: 52, sw: armW, sh: 12, dx: 0, dy: 8 },          // Left Arm back
      { sx: 48 + armW, sy: 20, sw: armW, sh: 12, dx: armW + 8, dy: 8 },   // Right Arm back
      { sx: 28, sy: 52, sw: 4, sh: 12, dx: armW, dy: 20 },                // Left Leg back
      { sx: 12, sy: 20, sw: 4, sh: 12, dx: armW + 4, dy: 20 },            // Right Leg back
    ] as Region[],
    backOverlay: [
      { sx: 56, sy: 8, sw: 8, sh: 8, dx: armW, dy: 0 },
      { sx: 32, sy: 36, sw: 8, sh: 12, dx: armW, dy: 8 },
      { sx: 56 + armW, sy: 52, sw: armW, sh: 12, dx: 0, dy: 8 },
      { sx: 48 + armW, sy: 36, sw: armW, sh: 12, dx: armW + 8, dy: 8 },
      { sx: 12, sy: 52, sw: 4, sh: 12, dx: armW, dy: 20 },
      { sx: 12, sy: 36, sw: 4, sh: 12, dx: armW + 4, dy: 20 },
    ] as Region[],
  };
}

function drawRegions(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  regions: Region[],
  offsetX: number,
  mul: number = 1,
) {
  for (const r of regions) {
    ctx.drawImage(
      img,
      r.sx * mul, r.sy * mul, r.sw * mul, r.sh * mul,
      r.dx + offsetX, r.dy, r.sw, r.sh,
    );
  }
}

export function SkinPreview({ skinData, isSlim }: { skinData: ArrayBuffer | string; isSlim: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const armW = isSlim ? 3 : 4;
  const viewW = armW + 8 + armW;
  const gap = 2;
  const canvasW = viewW * 2 + gap;
  const canvasH = 32;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = (img: HTMLImageElement, mul: number = 1) => {
      ctx.clearRect(0, 0, canvasW, canvasH);
      ctx.imageSmoothingEnabled = false;
      const regions = getSkinRegions(armW);
      drawRegions(ctx, img, regions.frontBase, 0, mul);
      drawRegions(ctx, img, regions.frontOverlay, 0, mul);
      drawRegions(ctx, img, regions.backBase, viewW + gap, mul);
      drawRegions(ctx, img, regions.backOverlay, viewW + gap, mul);
    };

    if (typeof skinData === "string") {
      // Static asset URL (e.g. /steve.png)
      const img = new Image();
      img.onload = () => render(img);
      img.src = skinData;
    } else {
      // ArrayBuffer from library entry — convert to ImageData then to data URL
      const bufLen = skinData.byteLength;
      const dim = bufLen === 128 * 128 * 4 ? 128 : 64;
      const imageData = new ImageData(new Uint8ClampedArray(skinData), dim, dim);
      const offscreen = document.createElement("canvas");
      offscreen.width = dim;
      offscreen.height = dim;
      const offCtx = offscreen.getContext("2d")!;
      offCtx.putImageData(imageData, 0, 0);
      const mul = dim === 128 ? 2 : 1;
      const img = new Image();
      img.onload = () => render(img, mul);
      img.src = offscreen.toDataURL();
    }
  }, [skinData, armW, canvasW, canvasH, viewW, gap]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasW}
      height={canvasH}
      style={{ imageRendering: "pixelated" }}
      draggable={false}
    />
  );
}

// --- Skin Card (list row layout) ---
export function SkinCard({
  entry, isActive, onSelect, onDelete, onExport, onRename, dict,
}: {
  entry: LibraryEntry;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onExport: () => void;
  onRename: () => void;
  dict: any;
}) {
  const { getConfirmation } = useConfirmation();

  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-lg border-2 overflow-hidden transition-colors cursor-pointer ${isActive
          ? "border-blue-500 dark:bg-neutral-800/60 bg-blue-50"
          : "border-transparent dark:hover:bg-neutral-800/40 hover:bg-neutral-100"}`}
      onClick={onSelect}
    >
      {/* Thumbnail */}
      <div className="shrink-0 flex items-center justify-center" style={{ height: 48 }}>
        <SkinPreview skinData={entry.skinData} isSlim={entry.isPocket} />
      </div>

      {/* Name + active badge */}
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
        <span className="text-sm font-medium dark:text-neutral-200 text-neutral-700 truncate">
          {entry.name}
        </span>
        {isActive && (
          <span className="text-[10px] text-blue-500 font-medium">
            {dict.library.activeSkin}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Button
          onClick={onExport}
          variant={"ghost"}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium dark:text-neutral-300 text-neutral-600 dark:hover:bg-neutral-600 hover:bg-neutral-200 cursor-pointer transition-colors"
        >
          <DownloadIcon className="w-3.5 h-3.5" />
          {dict.library.exportSkin}
        </Button>
        <Dropdown
          trigger={
            <Button variant="ghost" className="p-2 rounded-md dark:hover:bg-neutral-600 hover:bg-neutral-200 cursor-pointer transition-colors">
              <DotsVerticalIcon className="w-4 h-4 dark:text-neutral-400 text-neutral-500" />
            </Button>
          }
          align="end"
          side="bottom"
          size="sm"
        >
          <DropdownItem
            leftIcon={<Pencil1Icon className="w-4 h-4" />}
            onSelect={onRename}
          >
            {dict.library.renameSkin}
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem
            variant="destructive"
            leftIcon={<TrashIcon className="w-4 h-4" />}
            onSelect={async () => {
              const confirmed = await getConfirmation({
                title: dict.library.deleteSkin,
                description: dict.library.confirmDeleteDescription,
              });
              if (confirmed) onDelete();
            }}
          >
            {dict.library.deleteSkin}
          </DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
}
