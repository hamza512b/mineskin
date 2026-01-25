import * as Switch from "@radix-ui/react-switch";

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  id: string;
  disabled?: boolean;
}

export default function ToggleSwitch({
  label,
  checked,
  onCheckedChange,
  id,
  disabled,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between">
      <label
        className="text-sm dark:text-slate-300 select-none font-semibold"
        htmlFor={id}
      >
        {label}
      </label>
      <Switch.Root
        onCheckedChange={onCheckedChange}
        checked={checked}
        className="w-10 h-6 bg-slate-800 rounded-full relative shadow-md focus:ring focus:ring-blue-300 focus:outline-none data-[state=checked]:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        id={id}
        disabled={disabled}
      >
        <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-100 will-change-transform ltr:translate-x-0.5 ltr:data-[state=checked]:translate-x-[18px] rtl:translate-x-[17px] rtl:data-[state=checked]:translate-x-0.5 hover:bg-slate-50" />
      </Switch.Root>
    </div>
  );
}
