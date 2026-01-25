import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minecraft Skin Editor and Tester | Mineskin.pro",
  description:
    "Upload and test your Minecraft skins in real-time with MineSkin's 3D viewer. Test, edit, and see your skin from every angle before using it in-game.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
