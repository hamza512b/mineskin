import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { steps as tutorialSteps } from "./tutorialSteps";
import Overlay from "./Overlay";
import TutorialStepComponent from "./TutorialStep";
import { useTutorialState } from "@/hooks/useTutorialState";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useConfirmation } from "@/widgets/Confirmation/Confirmation";

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

  const handleFinish = () => {
    setHasCompletedTutorial(true);
  };

  if (!step) {
    return null;
  }

  return (
    <>
      <Overlay targetRect={targetRect} onClick={handleNext} />
      <AnimatePresence mode="wait">
        <TutorialStepComponent
          key={step.id}
          step={step}
          targetRect={targetRect}
          onNext={handleNext}
          onPrev={handlePrev}
          onFinish={handleFinish}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === filteredSteps.length - 1}
          onSkip={async () => {
            const confirmed = await getConfirmation({
              title: "Skip Tutorial?",
              description:
                "Are you sure you want to skip the tutorial? You can always restart it in settings.",
              confirmText: "Skip",
              cancelText: "Cancel",
            });
            if (confirmed) {
              setHasCompletedTutorial(true);
            }
          }}
        />
      </AnimatePresence>
    </>
  );
};

export default Tutorial;
