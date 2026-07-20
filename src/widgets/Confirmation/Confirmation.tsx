"use client";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { createContext, useCallback, useContext, useState } from "react";
import { useDictionary } from "@/i18n/DictionaryContext";

interface DialogContextProps {
  getConfirmation: ({
    title,
    description,
    cancelText,
    confirmText,
  }: {
    title: string;
    description: string;
    cancelText?: string;
    confirmText?: string;
  }) => Promise<boolean>;
}

export const DialogContext = createContext<DialogContextProps | undefined>(
  undefined,
);

export function ConfirmationDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");
  const [dialogCancelText, setDialogCancelText] = useState("");
  const [dialogConfirmText, setDialogConfirmText] = useState("");
  const [confirm, setConfirm] = useState<(value: boolean) => void>(() => {});
  const { dictionary } = useDictionary();
  const getConfirmation = useCallback(
    ({
      title,
      description,
      cancelText,
      confirmText,
    }: {
      title: string;
      description: string;
      cancelText?: string;
      confirmText?: string;
    }) => {
      setDialogOpen(true);
      setDialogTitle(title);
      setDialogDescription(description);
      setDialogCancelText(cancelText || "");
      setDialogConfirmText(confirmText || "");
      return new Promise<boolean>((resolve) => {
        setConfirm(() => resolve);
      });
    },
    [],
  );

  return (
    <DialogContext.Provider value={{ getConfirmation }}>
      {children}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogOverlay className="fixed inset-0 dark:bg-black/50 bg-white/50 z-[60]" />
        <DialogContent
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[700px] dark:bg-neutral-900 bg-neutral-100 rounded-lg p-8 border dark:border-neutral-700 border-neutral-200 shadow-lg overflow-y-auto max-h-dvh z-[60]">
          <DialogTitle className="text-2xl font-semibold mb-2 dark:text-neutral-100 text-neutral-900">
            {dialogTitle}
          </DialogTitle>
          {dialogDescription && (
            <DialogDescription className="mb-6 dark:text-neutral-400 text-neutral-600">
              {dialogDescription}
            </DialogDescription>
          )}

          <div className="flex justify-end gap-2">
            <button
              className="dark:bg-neutral-700 dark:hover:bg-neutral-800 dark:text-neutral-100 py-2 rounded-md font-medium transition-colors px-4 cursor-pointer hover:bg-neutral-200 text-neutral-900 bg-neutral-100"
              onClick={() => {
                setTimeout(() => {
                  setDialogOpen(false);
                  confirm(false);
                }, 0);
              }}
            >
              {dialogCancelText || dictionary.confirmation.cancel}
            </button>

            <button
              className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-neutral-100 py-2 rounded-md font-medium transition-colors px-4 cursor-pointer hover:bg-blue-200 text-neutral-900 bg-blue-100"
              autoFocus
              onClick={() => {
                setTimeout(() => {
                  setDialogOpen(false);
                  confirm(true);
                }, 0);
              }}
            >
              {dialogConfirmText || dictionary.confirmation.confirm}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
}

export function useConfirmation() {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error(
      "useConfirmation must be used within a ConfirmationDialogProvider",
    );
  }
  return context;
}
