import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Spinner } from "../Spinner";
import Link from "next/link";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outlined"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const buttonVariants = cva(
  "inline-flex justify-center items-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
        secondary:
          "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500",
        outlined:
          "border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-gray-400",
        ghost:
          "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-gray-400",
        danger: "bg-rose-900 hover:bg-rose-800 text-white focus:ring-red-500",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      isDisabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
      isDisabled: false,
    },
  },
);

// Extract the proper types from buttonVariants
type ButtonVariantsProps = VariantProps<typeof buttonVariants>;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button content
   */
  children: ReactNode;

  /**
   * Button variant
   * @default 'primary'
   */
  variant?: ButtonVariantsProps["variant"];

  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonVariantsProps["size"];

  /**
   * Full width button
   * @default false
   */
  fullWidth?: ButtonVariantsProps["fullWidth"];

  /**
   * Custom CSS class
   */
  className?: string;

  /**
   * Whether the button is in loading state
   * @default false
   */
  isLoading?: boolean;

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Icon to display before button text
   */
  leftIcon?: ReactNode;

  /**
   * Icon to display after button text
   */
  rightIcon?: ReactNode;

  /**
   * Use as Next.js Link component
   * @default false
   */
  asLink?: boolean;

  /**
   * URL to navigate to when used as a link
   * Only required when asLink is true
   */
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      className = "",
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      asLink = false,
      href,
      ...rest
    },
    ref,
  ) => {
    // Set appropriate spinner colors based on button variant
    const getSpinnerClasses = () => {
      if (variant === "outlined" || variant === "ghost") {
        return {
          fillColorClass: "fill-gray-700 dark:fill-gray-300",
          trackColorClass: "text-gray-300 dark:text-gray-600",
        };
      }
      return {
        fillColorClass: "fill-white",
        trackColorClass: "text-blue-400 dark:text-blue-300",
      };
    };

    const spinnerClasses = getSpinnerClasses();

    const buttonClasses = buttonVariants({
      variant,
      size,
      fullWidth,
      isDisabled: disabled || isLoading,
      className,
    });

    const content = (
      <>
        {isLoading && (
          <Spinner
            size="sm"
            className="mr-2"
            fillColorClass={spinnerClasses.fillColorClass}
            trackColorClass={spinnerClasses.trackColorClass}
          />
        )}

        {!isLoading && leftIcon && <span className="mr-1">{leftIcon}</span>}

        {children}

        {!isLoading && rightIcon && <span className="ml-1">{rightIcon}</span>}
      </>
    );

    if (asLink && href) {
      return (
        <Link href={href} className={buttonClasses}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isLoading || disabled}
        {...rest}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
