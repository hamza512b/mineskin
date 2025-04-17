import React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@radix-ui/react-icons";

interface AccordionProps {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function Accordion({
  label,
  children,
  defaultOpen = false,
}: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      type="single"
      defaultValue={defaultOpen ? "item" : undefined}
      collapsible
    >
      <AccordionPrimitive.Item
        value="item"
        className="mb-4 border border-slate-700 rounded-lg"
      >
        <AccordionPrimitive.Header>
          <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between text-lg p-4  dark:text-slate-300 font-semibold cursor-pointer">
            {label}
            <ChevronDownIcon
              className="ease-[cubic-bezier(0.87,_0,_0.13,_1)] transition-transform duration-300 group-data-[state=open]:rotate-180"
              aria-hidden
            />
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
        <AccordionPrimitive.Content className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden p-4 pt-0 ">
          <div className="pt-4 px-1">{children}</div>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  );
}
