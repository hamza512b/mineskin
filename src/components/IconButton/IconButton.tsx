import React from "react";

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
      onClick,
      className = "",
      children,
      disabled = false,
      active = false,
    }: IconButtonProps,
    ref,
  ) => {
    return (
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={`
        flex items-center justify-center 
        p-1 rounded-lg  cursor-pointer
        focus:outline-none focus:ring-1 focus:ring-offset-2 dark:focus:ring-offset-blue-600 border-none dark:focus:ring-blue-600 focus:ring-blue-300 focus:ring-offset-blue-300
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : active
              ? "dark:bg-blue-800 bg-blue-300"
              : "dark:hover:bg-blue-600 hover:bg-blue-300"
        } 
        ${className}
      `}
        ref={ref}
      >
        <div className="w-6 h-6">{children}</div>
      </button>
    );
  },
);

IconButton.displayName = "IconButton";

export default IconButton;
