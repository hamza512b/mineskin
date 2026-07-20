"use client";

import Button from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import useIsTouch from "@/hooks/useIsTouch";
import { useDictionary } from "@/i18n";
import {
  type LibraryEntry,
  getLibraryState,
  createLibraryEntry,
  saveActiveSkinToLibrary,
} from "@/store/libraryStore";
import type { MiSkiRenderer } from "@/core/MiSkiRenderer";
import { downloadFile } from "@/core/downloadFile";
import { MinecraftSkinMaterial } from "@/core/MeshMaterial";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@radix-ui/react-dialog";
import {
  Cross1Icon,
  ExclamationTriangleIcon,
  PlusIcon,
  UploadIcon,
} from "@radix-ui/react-icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useStore } from "zustand";
import { libraryStore } from "@/store/libraryStore";
import { getRendererState } from "@/store";
import { SkinCard, SkinPreview } from "./SkinCard";

type View = "grid" | "newSkin" | "minecraft";

const MinecraftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m2 4v4h4v2H8v4h2v-2h4v2h2v-4h-2v-2h4V6h-4v4h-4V6H6z"
    />
  </svg>
);

// --- Library Content ---
function LibraryContent({
  renderer,
  onClose,
  downloadTexture,
  isCoarse,
}: {
  renderer: MiSkiRenderer | null;
  onClose: () => void;
  downloadTexture: () => void;
  isCoarse: boolean;
}) {
  const { dictionary: dict } = useDictionary();
  const entries = useStore(libraryStore, (s) => s.entries);
  const activeSkinId = useStore(libraryStore, (s) => s.activeSkinId);
  const [view, setView] = useState<View>("grid");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Force-save current skin on dialog open
  useEffect(() => {
    if (renderer) {
      saveCurrentSkinToLibrary(renderer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectSkin = useCallback(
    async (entry: LibraryEntry) => {
      if (entry.id === activeSkinId) return;
      if (!renderer) return;

      // Save current skin before switching (don't bump updatedAt)
      await saveCurrentSkinToLibrary(renderer);

      // Stash current skin's undo history before switching
      if (activeSkinId) {
        getRendererState().stashHistory(activeSkinId);
      }

      // Load new skin (restores cached history if available)
      await renderer.loadSkinFromLibrary(
        entry.skinData,
        entry.isPocket,
        entry.id,
        entry.isDoubleRes ?? false,
      );
      getLibraryState().setActiveSkin(entry.id);
      onClose();
    },
    [activeSkinId, renderer, onClose],
  );

  const handleDeleteEntry = useCallback(
    async (id: string) => {
      const libState = getLibraryState();
      const isLastEntry = libState.entries.length === 1;

      if (isLastEntry) {
        // Don't delete the last entry — empty it instead
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = "/blank.png";
        });
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, 64, 64);
        const skinData = imageData.data.buffer.slice(0);

        await libState.updateEntry(id, {
          skinData,
          name: dict.library.defaultName,
          isPocket: false,
          updatedAt: Date.now(),
        });
        getRendererState().clearCachedHistory(id);
        if (renderer) {
          await renderer.loadSkinFromLibrary(skinData, false, id, false);
        }
        return;
      }

      const wasActive = libState.activeSkinId === id;
      await libState.deleteEntry(id);

      // Clean up cached history for deleted skin
      getRendererState().clearCachedHistory(id);

      // If the deleted skin was active, load the new active skin
      if (wasActive && renderer) {
        const newActive = libState.getActiveEntry();
        if (newActive) {
          await renderer.loadSkinFromLibrary(
            newActive.skinData,
            newActive.isPocket,
            newActive.id,
            newActive.isDoubleRes ?? false,
          );
        }
      }
    },
    [renderer, dict],
  );

  const handleExport = useCallback(
    (entry: LibraryEntry) => {
      if (entry.id === activeSkinId && renderer) {
        downloadTexture();
      } else {
        // Export from library entry data
        const dim = (entry.isDoubleRes ?? false) ? 128 : 64;
        const imageData = new ImageData(
          new Uint8ClampedArray(entry.skinData),
          dim,
          dim,
        );
        const canvas = document.createElement("canvas");
        canvas.width = dim;
        canvas.height = dim;
        const ctx = canvas.getContext("2d")!;
        ctx.putImageData(imageData, 0, 0);
        downloadFile(
          canvas.toDataURL("image/png"),
          `${entry.name}.png`,
          dict.saveImage,
        );
      }
    },
    [activeSkinId, renderer, downloadTexture, dict],
  );

  const handleRename = useCallback(async (id: string, name: string) => {
    if (!name.trim()) return;
    await getLibraryState().updateEntry(id, { name: name.trim() });
    setRenamingId(null);
  }, []);

  const handleCreateFromTemplate = useCallback(
    async (url: string, name: string, isPocket: boolean) => {
      if (!renderer) return;
      setIsLoading(true);
      await saveCurrentSkinToLibrary(renderer);

      // Stash current skin's history before creating new
      const currentId = getLibraryState().activeSkinId;
      if (currentId) {
        getRendererState().stashHistory(currentId);
      }

      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = url;
        });

        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, 64, 64);

        const entry = createLibraryEntry(name, imageData, isPocket, false);
        const libState = getLibraryState();
        await libState.addEntry(entry);
        libState.setActiveSkin(entry.id);
        await renderer.loadSkinFromLibrary(
          entry.skinData,
          entry.isPocket,
          entry.id,
          false,
        );
        onClose();
      } catch {
        toast.error(dict.importDialog.templateFailed, {
          position: "bottom-center",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [renderer, onClose, dict],
  );

  const handleCreateEmpty = useCallback(async () => {
    if (!renderer) return;
    await handleCreateFromTemplate(
      "/blank.png",
      dict.library.defaultName,
      false,
    );
  }, [renderer, dict, handleCreateFromTemplate]);

  const handleFileDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file || !renderer) return;

      if (
        (file.type && file.type !== "image/png") ||
        (!file.type && !file.name.toLowerCase().endsWith(".png"))
      ) {
        toast.error(dict.importDialog.invalidFormat, {
          position: "bottom-center",
        });
        return;
      }

      setIsLoading(true);
      await saveCurrentSkinToLibrary(renderer);

      // Stash current skin's history before importing
      const currentId = getLibraryState().activeSkinId;
      if (currentId) {
        getRendererState().stashHistory(currentId);
      }

      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = dataUrl;
        });

        const is128 = img.width === 128 && img.height === 128;
        if (!is128 && (img.width !== 64 || ![32, 64].includes(img.height))) {
          toast.error(dict.importDialog.invalidDimensions, {
            position: "bottom-center",
          });
          return;
        }

        // Process image without touching the renderer
        let material: MinecraftSkinMaterial;
        if (is128) {
          material = MinecraftSkinMaterial.createFrom128Image(img);
        } else if (img.height === 64) {
          material = MinecraftSkinMaterial.createFrom64Image(img);
        } else {
          material = MinecraftSkinMaterial.createFrom32Image(img);
        }

        const entry = createLibraryEntry(
          file.name.replace(/\.png$/i, ""),
          material.imageData,
          material.version === "slim",
          is128,
        );
        const libState = getLibraryState();
        await libState.addEntry(entry);
        libState.setActiveSkin(entry.id);
        await renderer.loadSkinFromLibrary(
          entry.skinData,
          entry.isPocket,
          entry.id,
          entry.isDoubleRes ?? false,
        );
        onClose();
      } catch {
        toast.error(dict.importDialog.uploadFailed, {
          position: "bottom-center",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [renderer, onClose, dict],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileDrop(Array.from(files));
      }
      e.target.value = "";
    },
    [handleFileDrop],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: { "image/png": [".png"] },
    multiple: false,
    noClick: view !== "newSkin",
    noDrag: view !== "newSkin",
  });

  const handleImportFromMinecraft = useCallback(async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      toast.error(dict.importDialog.usernameRequired, {
        position: "bottom-center",
      });
      return;
    }
    if (!renderer) return;

    setIsLoading(true);
    await saveCurrentSkinToLibrary(renderer);

    // Stash current skin's history before importing
    const currentId = getLibraryState().activeSkinId;
    if (currentId) {
      getRendererState().stashHistory(currentId);
    }

    try {
      const skinUrl = `https://minotar.net/skin/${encodeURIComponent(trimmed)}`;
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "";
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = skinUrl;
      });

      // Process image without touching the renderer
      const material =
        img.height === 64
          ? MinecraftSkinMaterial.createFrom64Image(img)
          : MinecraftSkinMaterial.createFrom32Image(img);

      const entry = createLibraryEntry(
        trimmed,
        material.imageData,
        material.version === "slim",
        false,
      );
      const libState = getLibraryState();
      await libState.addEntry(entry);
      libState.setActiveSkin(entry.id);
      await renderer.loadSkinFromLibrary(
        entry.skinData,
        entry.isPocket,
        entry.id,
        false,
      );
      onClose();
    } catch {
      toast.error(dict.importDialog.importFailed, {
        position: "bottom-center",
      });
    } finally {
      setIsLoading(false);
    }
  }, [username, renderer, onClose, dict]);

  // Sort entries by updatedAt (most recent first) — must be above conditional returns
  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => b.updatedAt - a.updatedAt),
    [entries],
  );

  // --- Views ---

  if (view === "minecraft") {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setView("newSkin")}
          className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer self-start"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 rtl:rotate-180"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
              clipRule="evenodd"
            />
          </svg>
          {dict.common.cancel}
        </button>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="minecraft-username"
            className="text-sm font-medium dark:text-neutral-200 text-neutral-700"
          >
            {dict.importDialog.username}
          </label>
          <input
            id="minecraft-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleImportFromMinecraft();
            }}
            placeholder={dict.importDialog.usernamePlaceholder}
            className="w-full px-3 py-2 rounded-md border dark:border-neutral-600 border-neutral-300 dark:bg-neutral-800 bg-white dark:text-neutral-100 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            disabled={isLoading}
          />
        </div>
        <Button
          variant="primary"
          onClick={handleImportFromMinecraft}
          isLoading={isLoading}
          disabled={isLoading}
          fullWidth
        >
          {dict.importDialog.import}
        </Button>
      </div>
    );
  }

  if (view === "newSkin") {
    return (
      <div className="flex flex-col gap-2 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg dark:bg-neutral-900/70 bg-neutral-100/70">
            <Spinner />
          </div>
        )}
        <button
          onClick={() => setView("grid")}
          className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer self-start"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 rtl:rotate-180"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
              clipRule="evenodd"
            />
          </svg>
          {dict.library.backToLibrary}
        </button>

        {/* Templates */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium dark:text-neutral-400 text-neutral-500 uppercase tracking-wider mt-2">
            {dict.library.templates}
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleCreateEmpty}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border dark:border-neutral-600 border-neutral-300 dark:hover:bg-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <SkinPreview skinData="/blank.png" isSlim={false} />

              <span className="text-xs font-medium dark:text-neutral-200 text-neutral-700">
                {dict.library.newEmpty}
              </span>
            </button>
            <button
              onClick={() =>
                handleCreateFromTemplate("/steve.png", "Steve", false)
              }
              className="flex flex-col items-center gap-2 p-3 rounded-lg border dark:border-neutral-600 border-neutral-300 dark:hover:bg-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <SkinPreview skinData="/steve.png" isSlim={false} />
              <span className="text-xs font-medium dark:text-neutral-200 text-neutral-700">
                Steve
              </span>
            </button>
            <button
              onClick={() =>
                handleCreateFromTemplate("/alex.png", "Alex", true)
              }
              className="flex flex-col items-center gap-2 p-3 rounded-lg border dark:border-neutral-600 border-neutral-300 dark:hover:bg-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <SkinPreview skinData="/alex.png" isSlim={true} />
              <span className="text-xs font-medium dark:text-neutral-200 text-neutral-700">
                Alex
              </span>
            </button>
          </div>
        </div>

        {/* Import options */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px dark:bg-neutral-700 bg-neutral-300" />
          <span className="text-xs dark:text-neutral-500 text-neutral-400 uppercase tracking-wider">
            {dict.importDialog.or}
          </span>
          <div className="flex-1 h-px dark:bg-neutral-700 bg-neutral-300" />
        </div>

        <button
          onClick={() => setView("minecraft")}
          className="flex items-center gap-4 p-4 rounded-lg border dark:border-neutral-600 border-neutral-300 dark:hover:bg-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer text-start"
        >
          <div className="shrink-0 w-10 h-10 rounded-lg dark:bg-neutral-700 bg-neutral-200 flex items-center justify-center">
            <MinecraftIcon className="w-5 h-5 dark:text-neutral-300 text-neutral-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium dark:text-neutral-100 text-neutral-900">
              {dict.importDialog.importFromMinecraft}
            </span>
            <span className="text-xs dark:text-neutral-400 text-neutral-500">
              {dict.importDialog.importFromMinecraftDescription}
            </span>
          </div>
        </button>

        {/* Hidden file input for mobile */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {isCoarse ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-4 p-4 rounded-lg border dark:border-neutral-600 border-neutral-300 dark:hover:bg-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer text-start"
          >
            <div className="shrink-0 w-10 h-10 rounded-lg dark:bg-neutral-700 bg-neutral-200 flex items-center justify-center">
              <UploadIcon className="w-5 h-5 dark:text-neutral-300 text-neutral-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium dark:text-neutral-100 text-neutral-900">
                {dict.importDialog.uploadFile}
              </span>
              <span className="text-xs dark:text-neutral-400 text-neutral-500">
                {dict.importDialog.uploadFileDescription}
              </span>
            </div>
          </button>
        ) : (
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed transition-colors cursor-pointer text-center ${
              isDragActive
                ? "border-blue-500 dark:bg-blue-900/20 bg-blue-50"
                : "dark:border-neutral-600 border-neutral-300 dark:hover:border-neutral-500 hover:border-neutral-400 dark:hover:bg-neutral-800/50 hover:bg-neutral-200/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-10 h-10 rounded-lg dark:bg-neutral-700 bg-neutral-200 flex items-center justify-center">
              <UploadIcon className="w-5 h-5 dark:text-neutral-300 text-neutral-600" />
            </div>
            <span className="text-sm font-medium dark:text-neutral-100 text-neutral-900">
              {isDragActive
                ? dict.importDialog.dropzoneActive
                : dict.importDialog.dropzoneText}
            </span>
            <span className="text-xs dark:text-neutral-400 text-neutral-500">
              {dict.importDialog.dropzoneHint}
            </span>
          </div>
        )}
      </div>
    );
  }

  // List view (default)
  return (
    <div className="flex flex-col gap-3 h-100">
      {sortedEntries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <span className="text-sm dark:text-neutral-400 text-neutral-500">
            {dict.library.noSkins}
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setView("newSkin")}
          >
            {dict.library.createNew}
          </Button>
        </div>
      ) : (
        <>
          <p className="text-xs dark:text-amber-400/80 text-amber-600/80 flex items-start gap-1.5">
            <ExclamationTriangleIcon className="text-inherit" />
            {dict.library.localStorageWarning}
          </p>
          <button
            className="flex items-center justify-center gap-2 p-2.5 rounded-lg border-2 border-dashed dark:border-neutral-600 border-neutral-300 dark:hover:bg-neutral-800/40 hover:bg-neutral-100 transition-colors cursor-pointer"
            onClick={() => setView("newSkin")}
          >
            <PlusIcon className="w-5 h-5 dark:text-neutral-400 text-neutral-500" />
            <span className="text-sm font-medium dark:text-neutral-400 text-neutral-500">
              {dict.library.newSkin}
            </span>
          </button>
          <div className="max-h-[calc(80dvh-80px)] overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col gap-1">
              {sortedEntries.map((entry) => (
                <React.Fragment key={entry.id}>
                  {renamingId === entry.id ? (
                    <div className="flex items-center gap-3 p-2">
                      <div
                        className="shrink-0 flex items-center justify-center"
                        style={{ height: 48 }}
                      >
                        <SkinPreview
                          skinData={entry.skinData}
                          isSlim={entry.isPocket}
                        />
                      </div>
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleRename(entry.id, renameValue);
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        onBlur={() => handleRename(entry.id, renameValue)}
                        className="flex-1 px-2 py-1 text-sm rounded border dark:border-neutral-600 border-neutral-300 dark:bg-neutral-800 bg-white dark:text-neutral-100 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <SkinCard
                      entry={entry}
                      isActive={entry.id === activeSkinId}
                      onSelect={() => handleSelectSkin(entry)}
                      onDelete={() => handleDeleteEntry(entry.id)}
                      onExport={() => handleExport(entry)}
                      onRename={() => {
                        setRenamingId(entry.id);
                        setRenameValue(entry.name);
                      }}
                      dict={dict}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- Helper: save current skin to library ---
function saveCurrentSkinToLibrary(renderer: MiSkiRenderer) {
  const skin = renderer.getMainSkin();
  const state = getRendererState();
  saveActiveSkinToLibrary(
    skin.material.imageData,
    state.skinIsPocket,
    state.skinIsDoubleRes,
  );
}

// --- Main Dialog Component ---
interface LibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renderer: MiSkiRenderer | null;
  downloadTexture: () => void;
}

const LibraryDialog: React.FC<LibraryDialogProps> = ({
  open,
  onOpenChange,
  renderer,
  downloadTexture,
}) => {
  const isCoarse = useIsTouch();
  const { dictionary: dict } = useDictionary();

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  if (isCoarse) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] safe-area-pb safe-area-pl safe-area-pr bg-neutral-50 dark:bg-neutral-800">
          <DrawerHeader className="flex flex-row justify-between items-center">
            <DrawerTitle>{dict.library.title}</DrawerTitle>
            <DrawerClose asChild>
              <Button className="ms-auto" variant={"secondary"}>
                <Cross1Icon className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <DrawerBody className="p-4 pt-0">
            <div className="px-4 pb-4">
              <LibraryContent
                renderer={renderer}
                onClose={handleClose}
                downloadTexture={downloadTexture}
                isCoarse={isCoarse}
              />
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 dark:bg-black/50 bg-white/50 z-50" />
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg dark:bg-neutral-900 bg-neutral-100 rounded-lg p-6 border dark:border-neutral-700 border-neutral-200 shadow-lg z-50">
        <div className="flex justify-between items-center mb-4">
          <DialogTitle className="text-lg font-semibold dark:text-neutral-100 text-neutral-900">
            {dict.library.title}
          </DialogTitle>
          <button
            onClick={handleClose}
            className="p-1 rounded-md dark:hover:bg-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <Cross1Icon className="w-4 h-4 dark:text-neutral-400 text-neutral-600" />
          </button>
        </div>
        <LibraryContent
          renderer={renderer}
          onClose={handleClose}
          downloadTexture={downloadTexture}
          isCoarse={isCoarse}
        />
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(LibraryDialog);
