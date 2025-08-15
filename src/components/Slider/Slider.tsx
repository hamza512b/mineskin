import React from "react";
import * as RadixSlider from "@radix-ui/react-slider";
import { initialState } from "@/core/State";

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
}

export default function Slider({
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
}: SliderProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm dark:text-slate-300 font-semibold">
          {label}
        </label>
        <span
          className={`text-sm w-12 text-right ${
            error ? "text-red-500" : "text-slate-300"
          }`}
        >
          {formatValue(value)}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <RadixSlider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[
            loop
              ? Math.abs((value % (max - min)) + min)
              : Math.min(Math.max(value, min), max),
          ]} // Clamp displayed value
          min={min}
          max={max}
          step={step}
          onValueChange={([val]) => onChange(val)}
        >
          <RadixSlider.Track className="bg-slate-800 relative grow rounded-full h-[3px]">
            <RadixSlider.Range
              className={`absolute rounded-full h-full ${
                error ? "bg-red-500" : "bg-blue-500"
              }`}
            />
          </RadixSlider.Track>
          <RadixSlider.Thumb
            className={`block w-5 h-5 dark:bg-white bg-slate-50 rounded-full shadow-lg hover:bg-slate-50 focus:outline-none focus:ring focus:ring-blue-300 cursor-pointer ${
              error ? "border-2 border-red-500" : ""
            }`}
            aria-label={label}
          />
        </RadixSlider.Root>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {initialState[key as keyof typeof initialState] !== undefined &&
        initialState[key as keyof typeof initialState] !== value && (
          <button
            className="mt-1 text-sm text-blue-500 cursor-pointer"
            onClick={() =>
              onChange(initialState[key as keyof typeof initialState] as number)
            }
          >
            Reset
          </button>
        )}
    </div>
  );
}
