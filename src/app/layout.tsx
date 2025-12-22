import CookiePopup from "@/widgets/CookiePopup";
import PWAInstallPopup from "@/widgets/PWAInstallPopup";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "../components/ui/toaster";
import "../styles/global.css";
import { ConfirmationDialogProvider } from "../widgets/Confirmation/Confirmation";

export const metadata: Metadata = {
  title: "Minecraft Skin Editor and Tester | Mineskin.pro",
  description:
    "Upload and test your Minecraft skins in real-time with MineSkin's 3D viewer. Test, edit, and see your skin from every angle before using it in-game.",
  keywords: [
    "minecraft skin",
    "minecraft skin tester",
    "minecraft skin editor",
    "minecraft skin preview",
    "3d skin viewer",
    "minecraft character",
    "skin editor",
    "minecraft avatar",
  ],
  authors: [{ name: "Hamza512b" }],
  applicationName: "MineSkin",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MineSkin",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    url: "https://mineskin.pro/",
    title: "Minecraft Skin Editor & Tester | Mineskin.pro",
    description:
      "Upload and preview your Minecraft skins in real-time with MineSkin's 3D viewer. Test, edit, and see your skin from every angle before using it in-game.",
    images: [{ url: "https://mineskin.pro/og-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Minecraft Skin Editor & Tester | Mineskin.pro",
    description:
      "Upload and preview your Minecraft skins in real-time with MineSkin's 3D viewer. Test, edit, and see your skin from every angle before using it in-game.",
    images: ["https://mineskin.pro/og-image.jpg"],
  },
};

const GoogleAnalyticsScript = () => {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_TAG_MANAGER}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('consent', 'default', {
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
          analytics_storage: "denied",
          wait_for_update: 1000,
        });
        gtag('js', new Date());
        gtag('config', '${process.env.NEXT_PUBLIC_TAG_MANAGER}');
        `}
      </Script>
    </>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://mineskin.pro/" />
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
      </head>
      <body>
        <GoogleAnalyticsScript />
        <TooltipProvider>
          <ConfirmationDialogProvider>{children}</ConfirmationDialogProvider>
          <Toaster />
        </TooltipProvider>
        <CookiePopup />
        {/* <SpeedInsights /> */}
        {/* <Analytics /> */}
        <PWAInstallPopup />
      </body>
    </html>
  );
}
