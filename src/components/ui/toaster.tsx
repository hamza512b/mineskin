"use client";
import { useIsDarkMode } from "@/hooks/useTheme"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const isDark = useIsDarkMode()

  return (
    <Sonner
      theme={isDark ? "dark" : "light"}
      {...props}
    />
  )
}

export { Toaster }
