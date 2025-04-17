import React from "react";
import Button from "@/components/Button";
import Dropdown, { DropdownItem } from "@/components/Dropdown";
import { EditorIcon, PreviewIcon } from "@/components/Icons/Icons";
import { SelectBox } from "@/components/Select";
import {
  DotsVerticalIcon,
  DownloadIcon,
  UploadIcon,
} from "@radix-ui/react-icons";
import clsx from "clsx";
type Mode = "Preview" | "Editing";

interface TopBarProps {
  className?: string;
  downlodTexture: () => void;
  uploadTexture: () => void;
  mode: "Preview" | "Editing";
  setMode: (mode: Mode) => void;
}

export default function ActionBar({
  className,
  downlodTexture,
  uploadTexture,
  mode,
  setMode,
}: TopBarProps) {
  const modeOptions = [
    {
      label: "Preview",
      value: "Preview",
      icon: (
        <PreviewIcon
          className="h-4 w-4 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
        />
      ),
    },
    {
      label: "Editing",
      value: "Editing",

      icon: (
        <EditorIcon
          className="h-4 w-4 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
        />
      ),
    },
  ];
  return (
    <div
      className={clsx(
        "p-2 w-full flex items-center justify-between gap-4 rounded-lg pointer-events-none [&_>_*]:pointer-events-auto select-none",
        className,
      )}
    >
      {mode ? (
        <SelectBox
          leftIcon={modeOptions.find((option) => option.value === mode)?.icon}
          options={modeOptions}
          value={mode}
          onValueChange={(mode: Mode) => setMode(mode)}
        />
      ) : (
        <div />
      )}
      <div className="flex gap-2">
        <div className="hidden md:flex gap-2 ">
          {/* Desktop buttons */}
          <Button
            variant="secondary"
            onClick={() => uploadTexture()}
            leftIcon={<UploadIcon className="h-4 w-4" aria-hidden="true" />}
          >
            Upload
          </Button>
          {mode === "Editing" && (
            <Button
              variant="primary"
              onClick={() => downlodTexture()}
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
                <Button variant={"ghost"}>
                  <DotsVerticalIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                  <span className="sr-only">Actions menu</span>
                </Button>
              }
            >
              <DropdownItem
                onClick={() => uploadTexture()}
                leftIcon={<UploadIcon className="h-4 w-4" />}
              >
                Upload
              </DropdownItem>
              <DropdownItem
                onClick={() => downlodTexture()}
                leftIcon={<DownloadIcon className="h-4 w-4" />}
              >
                Save
              </DropdownItem>
            </Dropdown>
          ) : (
            <Button
              variant="secondary"
              onClick={() => uploadTexture()}
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
