import Button from "@/components/Button";
import Dropdown, { DropdownItem } from "@/components/Dropdown";
import { EditorIcon, PreviewIcon } from "@/components/Icons/Icons";
import {
  DotsVerticalIcon,
  DownloadIcon,
  UploadIcon,
} from "@radix-ui/react-icons";
import clsx from "clsx";
import Link from "next/link";
import React, { useCallback } from "react";

export type Mode = "Preview" | "Editing";

interface TopBarProps {
  className?: string;
  downlodTexture: (() => void) | undefined;
  uploadTexture: ((setError?: (msg: string) => void) => void) | undefined;
  mode: "Editing" | "Preview";
}

function ActionBar({ className, downlodTexture, uploadTexture, mode }: TopBarProps) {
  const modeOptions = [
    {
      label: "Preview",
      value: "Preview",
      icon: (
        <PreviewIcon
          className="h-4 w-4 text-gray-50 dark:text-gray-400"
          aria-hidden="true"
        />
      ),
    },
    {
      label: "Editing",
      value: "Editing",

      icon: (
        <EditorIcon
          className="h-4 w-4 text-gray-50 dark:text-gray-400"
          aria-hidden="true"
        />
      ),
    },
  ];

  const handleUploadTexture = useCallback(() => {
    uploadTexture?.();
  }, [uploadTexture]);

  const handleDownloadTexture = useCallback(() => {
    downlodTexture?.();
  }, [downlodTexture]);

  return (
    <div
      className={clsx(
        "p-2 w-full flex items-center justify-between gap-4 rounded-lg pointer-events-none [&_>_*]:pointer-events-auto select-none",
        className,
      )}
    >
      <Dropdown
        trigger={
          <Button variant={"secondary"} size={"sm"}>
            {modeOptions.find((option) => option.value === mode)?.icon ||
              modeOptions[0].icon}
            <span className="ml-2">{mode || "Preview"}</span>
          </Button>
        }
      >
        <Link href="/preview">
          <DropdownItem
            leftIcon={<PreviewIcon className="h-4 w-4" />}
            className={clsx(
              mode === "Preview" &&
                "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium",
            )}
          >
            Preview
          </DropdownItem>
        </Link>
        <Link href="/editor">
          <DropdownItem
            leftIcon={<EditorIcon className="h-4 w-4" />}
            className={clsx(
              mode === "Editing" &&
                "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium",
            )}
          >
            Editor
          </DropdownItem>
        </Link>
      </Dropdown>
      <div className="flex gap-2">
        <div className="hidden md:flex gap-2 ">
          {/* Desktop buttons */}
          <Button
            size={"sm"}
            variant="secondary"
            onClick={handleUploadTexture}
            leftIcon={<UploadIcon className="h-4 w-4" aria-hidden="true" />}
          >
            Upload
          </Button>
          {mode === "Editing" && (
            <Button
              size={"sm"}
              variant="primary"
              onClick={handleDownloadTexture}
              leftIcon={<DownloadIcon className="h-4 w-4" aria-hidden="true" />}
            >
              Save
            </Button>
          )}
        </div>
        {/* Mobile dropdown menu */}
        <div className="block md:hidden">
          {mode === "Editing" ? (
            <Dropdown
              trigger={
                <Button variant={"ghost"} size={"sm"}>
                  <DotsVerticalIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                  <span className="sr-only">Actions menu</span>
                </Button>
              }
            >
              <DropdownItem
                onClick={handleUploadTexture}
                leftIcon={<UploadIcon className="h-4 w-4" />}
              >
                Upload
              </DropdownItem>
              <DropdownItem
                onClick={downlodTexture}
                leftIcon={<DownloadIcon className="h-4 w-4" />}
              >
                Save
              </DropdownItem>
            </Dropdown>
          ) : (
            <Button
              variant="secondary"
              onClick={handleUploadTexture}
              leftIcon={<UploadIcon className="h-4 w-4" aria-hidden="true" />}
              size={"sm"}
            >
              Upload
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(ActionBar);
