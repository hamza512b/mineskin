import IconButton from "@/components/IconButton/IconButton";
import { useDictionary } from "@/i18n";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import useMediaQuery from "../../hooks/useMediaQuery";
import { DetailPanelContent, DetailPanelProps } from "./DetailPanelContent";

const DetailPanel: React.FC<DetailPanelProps> = ({
  open,
  setOpen,
  reset,
  mode,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { dictionary: dict, locale } = useDictionary();
  const isRtl = locale === "ar";
  const slideDirection = isRtl ? "-100%" : "100%";

  if (isMobile) {
    return (
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <AnimatePresence>
          <Dialog.Portal>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ x: slideDirection }}
                animate={{ x: 0 }}
                exit={{ x: slideDirection }}
                transition={{ duration: 0.3 }}
                className="fixed right-0 rtl:right-auto rtl:left-0 top-0 h-full max-w-[300px] w-full overflow-y-auto"
              >
                <VisuallyHidden.Root>
                  <Dialog.Title>{dict.common.settings}</Dialog.Title>
                </VisuallyHidden.Root>
                <DetailPanelContent
                  open={open}
                  setOpen={setOpen}
                  reset={reset}
                  mode={mode}
                  className="p-0"
                  exitButton={
                    <Dialog.Close asChild>
                      <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
                        <Cross1Icon className="w-4 h-4" />
                      </button>
                    </Dialog.Close>
                  }
                />
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        </AnimatePresence>
      </Dialog.Root>
    );
  }
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="controlPanel"
          initial={{ width: 0 }}
          animate={{ width: "300px" }}
          exit={{ width: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <motion.div
            className="absolute inset-0 inset-y-2 rtl:right-0 rtl:left-auto"
            initial={{ transform: `translateX(${slideDirection})` }}
            animate={{ transform: "translateX(0)" }}
            exit={{ transform: `translateX(${slideDirection})` }}
            style={{
              width: "300px",
            }}
            transition={{ duration: 0.3 }}
          >
            <DetailPanelContent
              open={open}
              setOpen={setOpen}
              reset={reset}
              exitButton={
                <IconButton
                  label={dict.common.close}
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 rtl:right-auto rtl:left-4"
                >
                  <Cross1Icon className="w-4 h-4 m-1" />
                </IconButton>
              }
              mode={mode}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(DetailPanel);
