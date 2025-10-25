"use client";
import { MiSkEditingRenderer } from "@/core/MineSkinRenderer";
import { useRenderer } from "@/hooks/useRenderer";
import Head from "next/head";
import { MineskinCanvas } from "../components/MineskinCanvas/MineskinCanvas";
import { useTutorialState } from "@/hooks/useTutorialState";
import Tutorial from "@/components/Tutorial/Tutorial";

export default function EditorPage() {
  const [renderer, setCanvas] = useRenderer(MiSkEditingRenderer);
  const { hasCompletedTutorial } = useTutorialState();

  return (
    <>
      <Head>
        <title> Minecraft Skin Editor and Tester | Mineskin.pro</title>
        <meta
          name="description"
          content="Upload and test your Minecraft skins in real-time with MineSkin's 3D viewer. Test, edit, and see your skin from every angle before using it in-game."
        />
        <meta
          name="keywords"
          content="minecraft skin, minecraft skin tester, minecraft skin editor, minecraft skin preview, 3d skin viewer, minecraft character, skin editor, minecraft avatar"
        />
        <meta name="author" content="Hamza512b" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://mineskin.pro/" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mineskin.pro/" />
        <meta
          property="og:title"
          content="Minecraft Skin Editor & Tester | Mineskin.pro"
        />
        <meta
          property="og:description"
          content="Upload and preview your Minecraft skins in real-time with MineSkin's 3D viewer. Test, edit, and see your skin from every angle before using it in-game."
        />
        <meta property="og:image" content="https://mineskin.pro/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://mineskin.pro/" />
        <meta
          property="twitter:title"
          content="Minecraft Skin Editor & Tester | Mineskin.pro"
        />
        <meta
          property="twitter:description"
          content="Upload and preview your Minecraft skins in real-time with MineSkin's 3D viewer. Test, edit, and see your skin from every angle before using it in-game."
        />
        <meta
          property="twitter:image"
          content="https://mineskin.pro/og-image.jpg"
        />

        {/* Structured data for rich search results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "MineSkin - Minecraft Skin Editor & Tester",
              description:
                "Upload and preview your Minecraft skins in real-time with MineSkin's 3D viewer. Test, edit, and see your skin from every angle before using it in-game.",
              image: "https://mineskin.pro/og-image.jpg",
              url: "https://mineskin.pro/",
              applicationCategory: "GameApplication",
              operatingSystem: "Any",
              author: {
                "@type": "Person",
                name: "Hamza512b",
              },
            }),
          }}
        />
      </Head>
      <MineskinCanvas renderer={renderer} setCanvas={setCanvas}>
        {!hasCompletedTutorial && <Tutorial />}
      </MineskinCanvas>
    </>
  );
}
