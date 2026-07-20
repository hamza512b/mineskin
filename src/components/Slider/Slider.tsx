import * as RadixSlider from "@radix-ui/react-slider";
import * as Tooltip from "@radix-ui/react-tooltip";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { defaultFormValues } from "@/store";
import { useDictionary } from "@/i18n";
import { memo } from "react";

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  error?: string;
  formatValue?: (value: number) => string;
  loop?: boolean;
  editKey: string;
  disabled?: boolean;
  disabledTooltip?: string;
}

function SliderImpl({
  label,
  value,
  onChange,
  min,
  max,
  step,
  error,
  loop = false,
  formatValue = (v) => v.toFixed(2),
  editKey: key,
  disabled = false,
  disabledTooltip,
}: SliderProps) {
  const { dictionary: dict, locale } = useDictionary();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const content = (
    <div className={`mb-4 ${disabled ? "opacity-50" : ""}`}>
      <div className="flex justify-between items-start gap-2 mb-2">
        <label className="flex items-center gap-1.5 min-w-0 text-sm dark:text-neutral-300 font-semibold">
          <span className="break-words">{label}</span>
          {disabled && disabledTooltip && (
            <LockClosedIcon className="size-3.5 shrink-0 text-neutral-500 dark:text-neutral-400" />
          )}
        </label>
        <span
          className={`shrink-0 text-sm w-12 text-right rtl:text-left ${
            error ? "text-red-500" : "text-neutral-300"
          }`}
        >
          {formatValue(value)}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <RadixSlider.Root
          disabled={disabled}
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[
            loop
              ? Math.abs((value % (max - min)) + min)
              : Math.min(Math.max(value, min), max),
          ]} // Clamp displayed value
          min={min}
          max={max}
          step={step}
          dir={dir}
          onValueChange={([val]) => onChange(val)}
        >
          <RadixSlider.Track className="bg-neutral-800 relative grow rounded-full h-[3px]">
            <RadixSlider.Range
              className={`absolute rounded-full h-full ${
                error ? "bg-red-500" : "bg-blue-500"
              }`}
            />
          </RadixSlider.Track>
          <RadixSlider.Thumb
            className={`block w-5 h-5 dark:bg-white bg-neutral-50 rounded-full shadow-lg hover:bg-neutral-50 focus:outline-none focus:ring focus:ring-blue-300 cursor-pointer ${
              error ? "border-2 border-red-500" : ""
            }`}
            aria-label={label}
          />
        </RadixSlider.Root>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {!disabled &&
        defaultFormValues[key as keyof typeof defaultFormValues] !== undefined &&
        defaultFormValues[key as keyof typeof defaultFormValues] !== value && (
          <button
            className="mt-1 text-sm text-blue-500 cursor-pointer"
            onClick={() =>
              onChange(defaultFormValues[key as keyof typeof defaultFormValues] as number)
            }
          >
            {dict.common.reset}
          </button>
        )}
    </div>
  );

  if (disabled && disabledTooltip) {
    return (
      <Tooltip.Root delayDuration={200}>
        <Tooltip.Trigger asChild>
          <div className="cursor-help">{content}</div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-neutral-800 text-white px-2 py-1 rounded text-xs shadow-md max-w-xs"
            side="top"
            sideOffset={5}
          >
            {disabledTooltip}
            <Tooltip.Arrow className="fill-neutral-800" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  }

  return content;
}

export default memo(SliderImpl);
