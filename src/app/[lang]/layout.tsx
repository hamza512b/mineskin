import CapacitorInit from "@/components/CapacitorInit";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import { PopupQueueProvider } from "@/contexts/PopupQueueContext";
import {
  baseUrl,
  DictionaryProvider,
  generateAlternates,
  hasLocale,
  locales,
  type Locale,
} from "@/i18n";
import { getDictionary } from "@/i18n/dictionaries";
import CookiePopup from "@/widgets/CookiePopup";
import LanguageDetectionPopup from "@/widgets/LanguageDetectionPopup";
import OnboardingStepper from "@/widgets/OnboardingStepper";
import IOSInstallPopup from "@/widgets/IOSInstallPopup";
import PWAInstallPopup from "@/widgets/PWAInstallPopup";
import { DirectionProvider } from "@radix-ui/react-direction";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import type { Metadata } from "next";
import Script from "next/script";
import LocaleRedirect from "@/components/LocaleRedirect";
import { Toaster } from "../../components/ui/toaster";
import { ConfirmationDialogProvider } from "../../widgets/Confirmation/Confirmation";
import { HtmlLangSetter } from "./HtmlLangSetter";

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

  const alternates = generateAlternates("", locale);

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
    alternates,
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
      url: `${baseUrl}/${locale}/`,
      title: dict.metadata.title,
      description: dict.metadata.description,
      images: [{ url: `${baseUrl}/og-image.jpg` }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.metadata.title,
      description: dict.metadata.description,
      images: [`${baseUrl}/og-image.jpg`],
    },
  };
}

const GoogleAnalyticsScript = ({ lang }: { lang: string }) => {
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
        gtag('set', 'user_properties', { app_language: '${lang}' });
        gtag('config', '${process.env.NEXT_PUBLIC_TAG_MANAGER}', {
          app_language: '${lang}'
        });
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

  // A single non-locale segment like /preview matches [lang] (dynamic beats
  // catch-all) in dev and server builds alike, so the [...path] redirect never
  // runs. Redirect to the locale-prefixed path here instead; genuinely unknown
  // paths still 404 after the redirect (/foo → /en/foo → 404).
  if (!hasLocale(lang)) {
    return <LocaleRedirect />;
  }

  const dictionary = await getDictionary(lang as Locale);
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "MineSkin - Minecraft Skin Editor & Tester",
            description: dictionary.metadata.description,
            image: `${baseUrl}/og-image.jpg`,
            url: `${baseUrl}/${lang}/`,
            applicationCategory: "GameApplication",
            operatingSystem: "Any",
            inLanguage: lang,
            author: {
              "@type": "Person",
              name: "Hamza512b",
            },
          }),
        }}
      />
      <HtmlLangSetter lang={lang} dir={dir} />
      <ThemeInitializer />
      <CapacitorInit />
      <GoogleAnalyticsScript lang={lang} />
      <DictionaryProvider dictionary={dictionary} locale={lang as Locale}>
        <DirectionProvider dir={dir}>
          <TooltipProvider>
            <PopupQueueProvider>
              <ConfirmationDialogProvider>
                {children}
              </ConfirmationDialogProvider>
              <CookiePopup />
              <LanguageDetectionPopup />
              <PWAInstallPopup />
              <IOSInstallPopup />
            </PopupQueueProvider>
            <Toaster />
          </TooltipProvider>
          <OnboardingStepper />
        </DirectionProvider>
      </DictionaryProvider>
    </>
  );
}
