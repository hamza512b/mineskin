import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import { ReactNode } from "react";

const dropdownContentVariants = cva(
  "mx-2 min-w-[220px] bg-white dark:bg-neutral-800 rounded-md p-1.5 shadow-md border border-neutral-200 dark:border-neutral-700 animate-in fade-in-80 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 z-50",
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const dropdownItemVariants = cva(
  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 outline-none transition-colors focus:bg-neutral-100 dark:focus:bg-neutral-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  {
    variants: {
      variant: {
        default:
          "text-neutral-700 dark:text-neutral-200 focus:text-neutral-900 dark:focus:text-neutral-50",
        destructive: "text-red-500 focus:text-red-700 dark:focus:text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface DropdownProps extends DropdownMenu.DropdownMenuProps {
  /**
   * The trigger element that opens the dropdown
   */
  trigger: ReactNode;

  /**
   * The dropdown content
   */
  children: ReactNode;

  /**
   * Size of the dropdown content
   * @default 'md'
   */
  size?: VariantProps<typeof dropdownContentVariants>["size"];

  /**
   * Custom CSS class for the dropdown content
   */
  contentClassName?: string;

  /**
   * Alignment of the dropdown content relative to the trigger
   * @default 'center'
   */
  align?: DropdownMenu.DropdownMenuContentProps["align"];

  /**
   * Side on which the dropdown content is placed relative to the trigger
   * @default 'bottom'
   */
  side?: DropdownMenu.DropdownMenuContentProps["side"];
}

export interface DropdownItemProps extends DropdownMenu.DropdownMenuItemProps {
  /**
   * The item content
   */
  children: ReactNode;

  /**
   * Item variant style
   * @default 'default'
   */
  variant?: VariantProps<typeof dropdownItemVariants>["variant"];

  /**
   * Custom CSS class
   */
  className?: string;

  /**
   * Whether the item is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Icon to display before the item text
   */
  leftIcon?: ReactNode;

  /**
   * Icon to display after the item text
   */
  rightIcon?: ReactNode;
}

export function DropdownItem({
  children,
  variant = "default",
  className,
  disabled = false,
  leftIcon,
  rightIcon,
  ...props
}: DropdownItemProps) {
  return (
    <DropdownMenu.Item
      className={clsx(dropdownItemVariants({ variant }), className)}
      disabled={disabled}
      {...props}
    >
      {leftIcon && (
        <span className="mr-2 inline-flex items-center">{leftIcon}</span>
      )}
      {children}
      {rightIcon && (
        <span className="ml-auto pl-2 inline-flex items-center">
          {rightIcon}
        </span>
      )}
    </DropdownMenu.Item>
  );
}

export function DropdownSeparator() {
  return (
    <DropdownMenu.Separator className="h-px my-1 bg-neutral-200 dark:bg-neutral-700" />
  );
}

export function DropdownLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <DropdownMenu.Label
      className={clsx(
        "px-2 py-1.5 text-sm font-semibold text-neutral-500 dark:text-neutral-400",
        className,
      )}
    >
      {children}
    </DropdownMenu.Label>
  );
}

export default function Dropdown({
  trigger,
  children,
  size = "md",
  contentClassName,
  align = "center",
  side = "bottom",
  ...props
}: DropdownProps) {
  return (
    <DropdownMenu.Root {...props}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={clsx(dropdownContentVariants({ size }), contentClassName)}
          align={align}
          side={side}
          sideOffset={5}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
