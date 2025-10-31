"use client";
import useMediaQuery from "@/hooks/useMediaQuery"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const isDark = useMediaQuery("(prefers-color-scheme: dark)")

  return (
    <Sonner
      theme={isDark ? "dark" : "light"}
      {...props}
    />
  )
}

export { Toaster }
