import React from "react";
import { motion } from "framer-motion";

interface OverlayProps {
  targetRect: DOMRect | null;
  onClick: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ targetRect }) => {
  const padding = 10;

  return (
    <motion.div
      className="fixed inset-0 z-40 pointer-events-none"
      // onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: targetRect ? 1 : 0 }}
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
  );
};

export default Overlay;
