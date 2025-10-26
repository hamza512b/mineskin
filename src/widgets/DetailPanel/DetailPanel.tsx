import IconButton from "@/components/IconButton/IconButton";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import useMediaQuery from "../../hooks/useMediaQuery";
import { DetailPanelContent, DetailPanelProps } from "./DetailPanelContent";

const DetailPanel: React.FC<DetailPanelProps> = (props) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  if (isMobile) {
    return (
      <Dialog.Root open={props.open} onOpenChange={props.setOpen}>
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
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.3 }}
                className="fixed right-0 top-0 h-full max-w-[300px] w-full  overflow-y-auto"
              >
                <VisuallyHidden.Root>
                  <Dialog.Title>Settings</Dialog.Title>
                </VisuallyHidden.Root>
                <DetailPanelContent
                  {...props}
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
      {props.open && (
        <motion.div
          key="controlPanel"
          initial={{ width: 0 }}
          animate={{ width: "300px" }}
          exit={{ width: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <motion.div
            className="absolute inset-0 inset-y-2"
            initial={{ transform: "translateX(100%)" }}
            animate={{ transform: "translateX(0)" }}
            exit={{ transform: "translateX(100%)" }}
            style={{
              width: "300px",
            }}
            transition={{ duration: 0.3 }}
          >
            <DetailPanelContent
              {...props}
              exitButton={
                <IconButton
                  label="Close setting"
                  onClick={() => props.setOpen(false)}
                  className="absolute top-4 right-4"
                >
                  <Cross1Icon className="w-4 h-4 m-1" />
                </IconButton>
              }
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(DetailPanel);
