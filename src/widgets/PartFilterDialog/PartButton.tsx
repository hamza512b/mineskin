import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

export interface PartButtonProps {
  tooltip: string;
  onClick: () => void;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
}

export const PartButton: React.FC<PartButtonProps> = ({
  tooltip,
  onClick,
  style,
  className,
  children,
}) => {

  return (
    <Tooltip.Root delayDuration={300}>
      <Tooltip.Trigger asChild>
        <button
          onClick={onClick}
          style={style}
          className={className}
        >
          {children}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="bg-slate-800 text-white px-2 py-1 rounded text-sm shadow-md"
          side="top"
          sideOffset={5}
        >
          {tooltip}
          <Tooltip.Arrow className="fill-gray-800" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};
