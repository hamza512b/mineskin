"use client";
import { useIsDarkMode } from "@/hooks/useTheme"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const isDark = useIsDarkMode()

  return (
    <Sonner
      theme={isDark ? "dark" : "light"}
      toastOptions={{
        // Sonner's default action chip is 24px tall — an awkward target on a
        // phone, which is exactly where the undo toasts matter most. Inline
        // styles rather than classNames so they beat sonner's own stylesheet.
        actionButtonStyle: {
          height: "32px",
          padding: "0 12px",
          fontSize: "13px",
          fontWeight: 600,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
