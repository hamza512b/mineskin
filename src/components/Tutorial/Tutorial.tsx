import useMediaQuery from "@/hooks/useMediaQuery";
import { useTutorialState } from "@/hooks/useTutorialState";
import { useConfirmation } from "@/widgets/Confirmation/Confirmation";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";
import { AnimatePresence, motion, MotionStyle } from "framer-motion";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Button from "../Button";
import IconButton from "../IconButton/IconButton";
import { steps as tutorialSteps } from "./tutorialSteps";

const Tutorial: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const { setHasCompletedTutorial } = useTutorialState();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { getConfirmation } = useConfirmation();
  const filteredSteps = useMemo(() => {
    return tutorialSteps.filter((step) => {
      if (isMobile) {
        return step.id !== "part-filter-desktop";
      } else {
        return step.id !== "part-filter-mobile";
      }
    });
  }, [isMobile]);

  const step = filteredSteps[currentStep];

  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MotionStyle>({});

  const padding = 10;
  useLayoutEffect(() => {
    function calculatePosition() {
      let top;
      let left;
      let right;
      let x;
      let y;
      let transform;
      let width;

      const parent = tooltipRef.current?.parentElement?.getBoundingClientRect();
      if (step.placement && targetRect) {
        switch (step.placement) {
          case "top":
            top = `calc(${targetRect.top}px - 100% - ${padding})`;
            left = `calc(${targetRect.left + targetRect.width / 2}px - 50%)`;
            break;
          case "right": {
            top = `${targetRect.top - padding}px`;
            const leftValue = targetRect.right + padding * 2;
            left = `${leftValue}px`;
            if (parent) {
              width = `${parent.width - leftValue - padding}px`;
            }
            break;
          }
          case "bottom":
            top = `${targetRect.bottom + padding}px`;
            left = `calc(${targetRect.left + targetRect.width / 2}px - 50%)`;
            break;
          case "left": {
            top = `${targetRect.top - padding}px`;
            right = `calc(100% - ${targetRect.left - padding * 2}px)`;
            break;
          }
        }
      } else {
        top = "50%";
        left = "50%";
        x = "-50%";
        y = "-50%";
        if (parent) {
          width = `${parent.width - padding * 2}px`;
        }
        transform = `translate(${x}, ${y})`;
      }

      setPosition({
        top: typeof top === "number" ? `${top}px` : top,
        left: typeof left === "number" ? `${left}px` : left,
        right: typeof right === "number" ? `${right}px` : right,
        x,
        y,
        width,
        transform,
      });
    }

    calculatePosition();

    window.addEventListener("resize", calculatePosition);

    return () => {
      window.removeEventListener("resize", calculatePosition);
    };
  }, [step, targetRect]);

  useEffect(() => {
    if (!step) return;

    const updateTargetRect = () => {
      if (!step.target) {
        setTargetRect(null);
        return;
      }
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        setTargetRect(targetElement.getBoundingClientRect());
      }
    };

    updateTargetRect();

    // Update position on window resize or scroll
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);

    return () => {
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
    };
  }, [currentStep, step]);

  const handleNext = () => {
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    const confirmed = await getConfirmation({
      title: "Are you sure?",
      description:
        "Are you sure you want to skip the tutorial? You can always restart it later in the settings.",
    });
    if (confirmed) setHasCompletedTutorial(true);
  };

  const handleFinish = async () => {
    setHasCompletedTutorial(true);
  };

  const isFirstStep = currentStep == 0;
  const isLastStep = currentStep == filteredSteps.length - 1;

  return (
    <AnimatePresence mode="wait">
      <Dialog.Root open={true}>
        <Dialog.Portal>
          <Dialog.Overlay asChild>
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-full h-full">
                <defs>
                  <mask id="highlight-mask">
                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                    {targetRect && (
                      <motion.rect
                        fill="black"
                        rx="8"
                        initial={false}
                        animate={{
                          x: targetRect.left - padding,
                          y: targetRect.top - padding,
                          width: targetRect.width + 2 * padding,
                          height: targetRect.height + 2 * padding,
                        }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </mask>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="rgba(0, 0, 0, 0.5)"
                  mask="url(#highlight-mask)"
                />
              </svg>
            </motion.div>
          </Dialog.Overlay>
          <Dialog.Content asChild>
            <motion.div
              ref={tooltipRef}
              className="absolute max-w-md w-full min-w-0 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-transparent dark:border-gray-700 p-5 shadow-lg rounded-lg "
              style={position}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={
                position
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.95 }
              }
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              key={step.id}
            >
              <IconButton
                label="Skip"
                onClick={handleSkip}
                className="absolute top-3 right-3"
              >
                <Cross1Icon className="w-4 h-4 m-1" />
              </IconButton>
              <Dialog.Title className="text-lg font-bold mb-2">
                {step.title}
              </Dialog.Title>
              <Dialog.Description className="text-sm">
                {step.content}
              </Dialog.Description>
              <div className="flex justify-between gap-2 mt-4">
                <span>
                  {currentStep + 1} / {filteredSteps.length}
                </span>
                {isFirstStep ? (
                  <Button
                    onClick={handleSkip}
                    variant={"outlined"}
                    className="ml-auto"
                  >
                    Skip tutorial
                  </Button>
                ) : (
                  <Button
                    onClick={handlePrev}
                    variant={"outlined"}
                    className="ml-auto"
                  >
                    Previous
                  </Button>
                )}
                {isLastStep ? (
                  <Button onClick={handleFinish} variant={"primary"}>
                    Finish
                  </Button>
                ) : (
                  <Button onClick={handleNext} variant={"primary"}>
                    Next
                  </Button>
                )}
              </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </AnimatePresence>
  );
};

export default Tutorial;
