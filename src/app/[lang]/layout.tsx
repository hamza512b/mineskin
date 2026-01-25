import CookiePopup from "@/widgets/CookiePopup";
import PWAInstallPopup from "@/widgets/PWAInstallPopup";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { Toaster } from "../../components/ui/toaster";
import "../../styles/global.css";
import { ConfirmationDialogProvider } from "../../widgets/Confirmation/Confirmation";
import { hasLocale, locales, type Locale, DictionaryProvider } from "@/i18n";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "en";
  const dict = await getDictionary(locale);

  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
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
      title: dict.metadata.title,
      description: dict.metadata.description,
      images: [{ url: "https://mineskin.pro/og-image.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.metadata.title,
      description: dict.metadata.description,
      images: ["https://mineskin.pro/og-image.jpg"],
    },
  };
}

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

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dictionary = await getDictionary(lang as Locale);
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir}>
      <head>
        <link rel="canonical" href="https://mineskin.pro/" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "MineSkin - Minecraft Skin Editor & Tester",
              description: dictionary.metadata.description,
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
        <DictionaryProvider dictionary={dictionary} locale={lang as Locale}>
          <TooltipProvider>
            <ConfirmationDialogProvider>
              {children}
            </ConfirmationDialogProvider>
            <Toaster />
          </TooltipProvider>
          <CookiePopup />
          <PWAInstallPopup />
        </DictionaryProvider>
      </body>
    </html>
  );
}
