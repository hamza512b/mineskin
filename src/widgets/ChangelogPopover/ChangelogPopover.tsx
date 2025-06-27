import IconButton from "@/components/IconButton/IconButton";
import * as Icons from "@/components/Icons/Icons";
import * as Popover from "@radix-ui/react-popover";
import React from "react";
import { cn } from "@/lib/utils";

interface ChangelogPopoverProps {
  content: string;
  className?: string;
}
export const ChangelogPopover: React.FC<ChangelogPopoverProps> = ({
  content,
  className,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("hidden md:block", className)}>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <IconButton aria-label="View changelog" label={"Changelog"}>
            <Icons.InfoCircle />
          </IconButton>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="z-50 w-96 max-h-[500px] overflow-y-auto rounded-lg bg-white dark:bg-gray-900 p-6 shadow-lg outline-none animate-in fade-in-0 zoom-in-95"
            sideOffset={5}
            side="top"
            align="end"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Changelog</h2>
              <Popover.Close aria-label="Close" asChild>
                <IconButton aria-label="Close changelog" label={"Close"}>
                  <Icons.Close />
                </IconButton>
              </Popover.Close>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div>
                Need help? Join our discord server on{" "}
                <a
                  href="https://discord.gg/2egvhmqdza"
                  target="_blank"
                  rel="noreferrer"
                >
                  Discord
                </a>
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: content
                    .replace(/##/g, "<h2>")
                    .replace(/###/g, "<h3>")
                    .replace(/\*\*/g, "<strong>")
                    .replace(/\*/g, "</strong>"),
                }}
              />
            </div>

            <Popover.Arrow className="fill-white dark:fill-gray-900" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};
