import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

export interface PartButtonProps {
  label: string;
  tooltip: string;
  isActive: boolean;
  onClick: () => void;
  width: number;
  height: number;
  style?: React.CSSProperties;
}

export const PartButton: React.FC<PartButtonProps> = ({
  tooltip,
  isActive,
  onClick,
  width,
  height,
  style,
}) => {
  const [hover, setHover] = React.useState(false);
  const baseColor = isActive ? "#4A90E2" : "#555";
  const hoverColor = isActive ? "#357ABD" : "#666";
  return (
    <Tooltip.Root delayDuration={300}>
      <Tooltip.Trigger asChild>
        <button
          onClick={onClick}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            width,
            height,
            backgroundColor: hover ? hoverColor : baseColor,
            border: "1px solid #333",
            position: "absolute",
            cursor: "pointer",
            transition: "background-color 0.2s",
            ...style,
          }}
        />
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
