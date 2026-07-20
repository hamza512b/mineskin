import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { baseUrl } from "@/i18n/config";
import "../styles/global.css";

const SITE_TITLE = "Minecraft Skin Editor and Tester | Mineskin.pro";
const SITE_DESCRIPTION =
  "Upload and test your Minecraft skins in real-time with MineSkin's 3D viewer. Test, edit, and see your skin from every angle before using it in-game. Free on the web, iOS, and Android.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  applicationName: "MineSkin",
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    "Minecraft skin editor",
    "Minecraft skin maker",
    "Minecraft skin creator",
    "3D skin viewer",
    "skin preview",
    "skin tester",
    "MineSkin",
  ],
  icons: {
    icon: [
      { url: "/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MineSkin",
  },
  openGraph: {
    type: "website",
    siteName: "MineSkin",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: baseUrl,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MineSkin — Minecraft skin editor with 3D preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning className="scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mineskin-theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
        {/*
          Guard against the Google Translate vs. React DOM crash: when the
          browser's translator rewrites text nodes in place, they no longer
          match React's fiber tree, and React's next commit throws
          "NotFoundError: Failed to execute 'insertBefore'/'removeChild'"
          which unwinds to the error boundary and looks like a startup
          failure (Sentry MINESKIN-1S). Patching the Node prototypes to no-op
          when the parent no longer matches keeps the app alive. Must run
          before hydration, hence an inline head script.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(typeof Node!=='function'||!Node.prototype)return;var oi=Node.prototype.insertBefore;Node.prototype.insertBefore=function(n,r){if(r&&r.parentNode!==this)return n;return oi.apply(this,arguments)};var orc=Node.prototype.removeChild;Node.prototype.removeChild=function(c){if(c&&c.parentNode!==this)return c;return orc.apply(this,arguments)}})()`,
          }}
        />
      </head>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
