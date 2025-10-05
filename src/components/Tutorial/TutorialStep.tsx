import { Cross1Icon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import React, { useLayoutEffect, useRef, useState } from "react";
import Button from "../Button";
import IconButton from "../IconButton/IconButton";
import { TutorialStep as TutorialStepProps } from "./tutorialSteps";

interface Props {
  step: TutorialStepProps;
  targetRect: DOMRect | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onFinish: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const TutorialStepComponent: React.FC<Props> = ({
  step,
  targetRect,
  onNext,
  onPrev,
  onSkip,
  onFinish,
  isFirstStep,
  isLastStep,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    right: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (!targetRect || !tooltipRef.current) return;

    const tooltipNode = tooltipRef.current;
    const tooltipRect = tooltipNode.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;

    if (tooltipWidth === 0 || tooltipHeight === 0) {
      return;
    }

    const PADDING = 20;
    const VIEWPORT_MARGIN = 20;
    const { top, right, bottom, left, width, height } = targetRect;
    const { innerWidth: vpWidth, innerHeight: vpHeight } = window;

    let newTop: number = 0;
    let newLeft: number = 0;
    const placement = step.placement || "bottom";

    // Calculate initial position based on placement
    switch (placement) {
      case "top":
        newTop = top - PADDING - tooltipHeight;
        newLeft = left + width / 2 - tooltipWidth / 2;
        break;
      case "bottom":
        newTop = bottom + PADDING;
        newLeft = left + width / 2 - tooltipWidth / 2;
        break;
      case "left":
        newTop = top + height / 2 - tooltipHeight / 2;
        newLeft = left - PADDING - tooltipWidth;
        break;
      case "right":
        newTop = top + height / 2 - tooltipHeight / 2;
        newLeft = right + PADDING;
        break;
      default:
        newTop = vpHeight / 2 - tooltipHeight / 2;
        newLeft = vpWidth / 2 - tooltipWidth / 2;
        break;
    }

    // Adjust horizontal position to stay within viewport
    if (newLeft < VIEWPORT_MARGIN) {
      newLeft = VIEWPORT_MARGIN;
    }
    if (newLeft + tooltipWidth > vpWidth - VIEWPORT_MARGIN) {
      newLeft = vpWidth - VIEWPORT_MARGIN - tooltipWidth;
    }

    const newRight = innerWidth - newLeft - tooltipWidth;

    // Adjust vertical position to stay within viewport
    if (newTop < VIEWPORT_MARGIN) {
      newTop = VIEWPORT_MARGIN;
    }
    if (newTop + tooltipHeight > vpHeight - VIEWPORT_MARGIN) {
      newTop = vpHeight - VIEWPORT_MARGIN - tooltipHeight;
    }

    setPosition({ top: newTop, left: newLeft, right: newRight });
  }, [step, targetRect]);

  if (!targetRect) return null;

  return (
    <motion.div
      ref={tooltipRef}
      className="fixed z-50 max-w-sm w md:w-auto  bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-transparent dark:border-gray-700 p-5 shadow-lg rounded-lg"
      style={
        position
          ? { top: position.top, left: position.left, right: position.right }
          : { opacity: 0, pointerEvents: "none" }
      }
      initial={{ opacity: 0, scale: 0.9 }}
      animate={position ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <IconButton
        label="Skip"
        onClick={onSkip}
        className="absolute top-3 right-3"
      >
        <Cross1Icon className="w-4 h-4 m-1" />
      </IconButton>
      <h3 className="text-lg font-bold mb-2">{step.title}</h3>
      <div className="text-sm">{step.content}</div>
      <div className="flex justify-between gap-2 mt-4">
        {!isFirstStep ? (
          <Button onClick={onPrev} variant={"outlined"}>
            Previous
          </Button>
        ) : (
          <div />
        )}
        {isLastStep ? (
          <Button onClick={onFinish}>Finish</Button>
        ) : (
          <Button onClick={onNext}>Next</Button>
        )}
      </div>
    </motion.div>
  );
};

export default TutorialStepComponent;
