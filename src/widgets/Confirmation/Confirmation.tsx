"use client";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { createContext, useCallback, useContext, useState } from "react";

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
        <DialogOverlay className="fixed inset-0 dark:bg-black/50 bg-white/50 z-50" />
        <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[700px] dark:bg-slate-900 bg-slate-100 rounded-lg p-8 border dark:border-slate-700 border-slate-200 shadow-lg overflow-y-auto max-h-dvh z-50">
          <DialogTitle className="text-2xl font-semibold mb-2 dark:text-slate-100 text-slate-900">
            {dialogTitle}
          </DialogTitle>
          {dialogDescription && (
            <DialogDescription className="mb-6 dark:text-slate-400 text-slate-600">
              {dialogDescription}
            </DialogDescription>
          )}

          <div className="flex justify-end gap-2">
            <button
              className="dark:bg-slate-700 dark:hover:bg-slate-800 dark:text-slate-100 py-2 rounded-md font-medium transition-colors px-4 cursor-pointer hover:bg-slate-200 text-slate-900 bg-slate-100"
              onClick={() => {
                setDialogOpen(false);
                confirm(false);
              }}
            >
              {dialogCancelText || "Cancel"}
            </button>

            <button
              className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-slate-100 py-2 rounded-md font-medium transition-colors px-4 cursor-pointer hover:bg-blue-200 text-slate-900 bg-blue-100"
              autoFocus
              onClick={() => {
                setDialogOpen(false);
                confirm(true);
              }}
            >
              {dialogConfirmText || "Confirm"}
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
