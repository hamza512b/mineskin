import Button from "@/components/Button";
import Dropdown, { DropdownItem } from "@/components/Dropdown";
import { EditorIcon, PreviewIcon } from "@/components/Icons/Icons";
import { useDictionary } from "@/i18n";
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

function ActionBar({
  className,
  downlodTexture,
  uploadTexture,
  mode,
}: TopBarProps) {
  const { dictionary: dict, locale } = useDictionary();

  const modeOptions = [
    {
      label: dict.common.preview,
      value: "Preview",
      icon: (
        <PreviewIcon
          className="h-4 w-4 text-gray-50 dark:text-gray-400"
          aria-hidden="true"
        />
      ),
    },
    {
      label: dict.common.editing,
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

  const currentModeLabel =
    mode === "Preview" ? dict.common.preview : dict.common.editing;

  return (
    <div
      className={clsx(
        "w-full flex items-center justify-between gap-4 rounded-lg pointer-events-none [&_>_*]:pointer-events-auto select-none",
        "p-2 standalone:pb-8",
        className,
      )}
    >
      <Dropdown
        trigger={
          <Button variant={"secondary"} size={"sm"}>
            {modeOptions.find((option) => option.value === mode)?.icon ||
              modeOptions[0].icon}
            <span className="ml-2 rtl:ml-0 rtl:mr-2">{currentModeLabel}</span>
          </Button>
        }
      >
        <Link href={`/${locale}/preview`}>
          <DropdownItem
            leftIcon={<PreviewIcon className="h-4 w-4" />}
            className={clsx(
              mode === "Preview" &&
                "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium",
            )}
          >
            {dict.common.preview}
          </DropdownItem>
        </Link>
        <Link href={`/${locale}/editor`}>
          <DropdownItem
            leftIcon={<EditorIcon className="h-4 w-4" />}
            className={clsx(
              mode === "Editing" &&
                "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium",
            )}
          >
            {dict.common.editor}
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
            {dict.common.upload}
          </Button>
          {mode === "Editing" && (
            <Button
              size={"sm"}
              variant="primary"
              onClick={handleDownloadTexture}
              leftIcon={<DownloadIcon className="h-4 w-4" aria-hidden="true" />}
            >
              {dict.common.save}
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
                  <span className="sr-only">{dict.common.actionsMenu}</span>
                </Button>
              }
            >
              <DropdownItem
                onClick={handleUploadTexture}
                leftIcon={<UploadIcon className="h-4 w-4" />}
              >
                {dict.common.upload}
              </DropdownItem>
              <DropdownItem
                onClick={downlodTexture}
                leftIcon={<DownloadIcon className="h-4 w-4" />}
              >
                {dict.common.save}
              </DropdownItem>
            </Dropdown>
          ) : (
            <Button
              variant="secondary"
              onClick={handleUploadTexture}
              leftIcon={<UploadIcon className="h-4 w-4" aria-hidden="true" />}
              size={"sm"}
            >
              {dict.common.upload}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(ActionBar);
