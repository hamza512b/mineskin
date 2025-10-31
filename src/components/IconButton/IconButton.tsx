import React from "react";
import { cn } from "@/lib/utils";

interface IconButtonProps extends React.PropsWithChildren {
  label: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  active?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

const IconButton: React.FC<IconButtonProps> = React.forwardRef(
  (
    {
      label,
      className = "",
      children,
      disabled = false,
      active = false,
      ...rest
    }: IconButtonProps,
    ref,
  ) => {
    return (
      <button
        {...rest}
        type="button"
        aria-label={label}
        disabled={disabled}
        className={cn(
          "flex items-center justify-center p-1 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-offset-2 dark:focus:ring-offset-blue-600 border-none dark:focus:ring-blue-600 focus:ring-blue-300 focus:ring-offset-blue-300",
          {
            "opacity-50 cursor-not-allowed": disabled,
            "dark:bg-blue-800 bg-blue-300": active,
            "dark:hover:bg-blue-600 hover:bg-blue-300": !active,
          },
          className,
        )}
        ref={ref}
      >
        <div className="w-6 h-6">{children}</div>
      </button>
    );
  },
);

IconButton.displayName = "IconButton";

export default IconButton;
