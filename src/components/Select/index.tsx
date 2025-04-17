import React, { forwardRef, ReactNode } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cva, type VariantProps } from "class-variance-authority";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import clsx from "clsx";

const selectTriggerVariants = cva(
  "inline-flex items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500 data-[placeholder]:text-gray-500 dark:data-[placeholder]:text-gray-400 max-w-[200px] gap-2",
  {
    variants: {
      variant: {
        default: "text-gray-700 dark:text-gray-200",
        error:
          "border-red-500 focus:ring-red-500 text-gray-700 dark:text-gray-200",
      },
      size: {
        sm: "h-8 text-sm",
        md: "h-10 text-sm",
        lg: "h-12 text-base",
      },
      fullWidth: {
        true: "w-full",
        false: "w-min",
      },
      isDisabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
      isDisabled: false,
    },
  },
);

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {
  /**
   * Error state
   * @default false
   */
  error?: boolean;
  /**
   * Indicates if the up icon should be displayed
   * @default false
   */
  isUp?: boolean;
}

const SelectTrigger = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isDisabled,
      children,
      error,
      isUp,
      ...props
    },
    ref,
  ) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={selectTriggerVariants({
        variant: error ? "error" : variant,
        size,
        fullWidth,
        isDisabled,
        className,
      })}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        {isUp ? (
          <ChevronUpIcon className="h-4 w-4 opacity-50" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        )}
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  ),
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={clsx(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-md animate-in fade-in-80",
        position === "popper" &&
          "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-6 bg-white dark:bg-gray-800 cursor-default">
        <ChevronUpIcon />
      </SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport className="p-1">
        {children}
      </SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-6 bg-white dark:bg-gray-800 cursor-default">
        <ChevronDownIcon />
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={clsx(
      "px-2 py-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400",
      className,
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

export interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  /**
   * Item content
   */
  children: ReactNode;

  /**
   * Icon to display before the item text
   */
  icon?: ReactNode;

  /**
   * Custom CSS class
   */
  className?: string;
}

const SelectItem = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, children, icon, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={clsx(
      "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-gray-100 dark:focus:bg-gray-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    {icon && <span className="mr-2 flex items-center">{icon}</span>}
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={clsx("h-px my-1 bg-gray-200 dark:bg-gray-700", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export interface SelectBoxProps extends React.ComponentProps<typeof Select> {
  /**
   * Array of options for the select
   */
  options: {
    value: string;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
  }[];

  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string;

  /**
   * Size of the select
   * @default 'md'
   */
  size?: VariantProps<typeof selectTriggerVariants>["size"];

  /**
   * Whether to use the full width available
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Whether the select is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Error state
   * @default false
   */
  error?: boolean;

  /**
   * Custom CSS classes for the trigger element
   */
  className?: string;

  /**
   * Icon to display before the select value
   */
  leftIcon?: ReactNode;
  /**
   * Whether to display the select icon upwards
   * @default false
   */
  selectIconUp?: boolean;
}

export function SelectBox({
  options,
  placeholder = "Select an option",
  size = "md",
  fullWidth = false,
  disabled = false,
  error = false,
  className,
  leftIcon,
  selectIconUp,
  ...props
}: SelectBoxProps) {
  return (
    <Select {...props}>
      <SelectTrigger
        size={size}
        fullWidth={fullWidth}
        isDisabled={disabled}
        error={error}
        className={className}
        isUp={selectIconUp}
      >
        <div className="flex items-center gap-1">
          {leftIcon && <span className="flex items-center">{leftIcon}</span>}
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            icon={option.icon}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
