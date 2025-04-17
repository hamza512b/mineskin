import React, { useEffect, useRef } from "react";
import { FieldError } from "react-hook-form";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError | string;
  required?: boolean;
  autoComplete?: string;
  fullWidth?: boolean;
  showErrorIcon?: boolean;
}

export default function Input({
  label,
  value,
  type = "text",
  className = "",
  id,
  error,
  required,
  autoComplete,
  fullWidth = true,
  ...props
}: InputProps) {
  const gerenatedID = React.useId();
  // Generate a unique ID if none is provided
  const inputId = id || `input-${gerenatedID}`;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (input && type === "number") {
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
      };

      input.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        input.removeEventListener("wheel", handleWheel);
      };
    }

    return () => {};
  }, [type]);

  const errorMessage = typeof error === "string" ? error : error?.message;

  return (
    <div className={`mb-2 ${fullWidth ? "w-full" : ""}`}>
      <label
        htmlFor={inputId}
        className="text-sm dark:text-slate-300 mb-1 block font-semibold"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type={type}
          value={value}
          required={required}
          autoComplete={autoComplete}
          aria-label={label}
          aria-invalid={error ? "true" : "false"}
          aria-errormessage={error ? `${inputId}-error` : undefined}
          aria-valuenow={type === "number" ? Number(value) : undefined}
          className={`
            block w-full px-3 py-2 rounded-md shadow-sm 
            transition-colors appearance-none
            dark:bg-slate-800 dark:text-white
            focus:outline-none focus:ring-2
            border ${
              errorMessage
                ? "dark:border-red-500/50 border-red-500"
                : "dark:border-slate-700/50 border-gray-300 focus:border-blue-600 focus:ring-blue-600 dark:hover:border-slate-600/50"
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {errorMessage && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-sm text-red-500 dark:text-red-400"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
