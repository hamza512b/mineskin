/* eslint-disable @next/next/no-img-element */
import { hasLocale, type Locale } from "@/i18n";
import { baseUrl } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { STORE_LINKS } from "@/lib/storeLinks";
import {
  ArrowRight,
  Box,
  Coffee,
  Heart,
  Pencil,
  Smartphone,
  Sparkles,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { NativeRedirect } from "./NativeRedirect";
import StoreBadges from "@/widgets/StoreBadges";
import CoffeeButton from "@/widgets/CoffeeButton";

export default function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  return <HomeContent params={params} />;
}

async function HomeContent({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "en";
  const dict = await getDictionary(locale as Locale);
  const home = dict.home;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MineSkin - Minecraft Skin Editor & 3D Previewer",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web, iOS, Android",
    url: `${baseUrl}/${locale}/home`,
    image: `${baseUrl}/og-image.jpg`,
    description: home.heroDescription,
    sameAs: [STORE_LINKS.ios, STORE_LINKS.android],
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "0",
      highPrice: "1.99",
      priceCurrency: "USD",
    },
  };

  const featureCards = [
    {
      title: home.featureLightingTitle,
      description: home.featureLightingDescription,
      glyph: <Sun className="h-5 w-5" strokeWidth={1.5} />,
    },
    {
      title: home.featurePreviewTitle,
      description: home.featurePreviewDescription,
      glyph: <Box className="h-5 w-5" strokeWidth={1.5} />,
    },
    {
      title: home.featureEditorTitle,
      description: home.featureEditorDescription,
      glyph: <Pencil className="h-5 w-5" strokeWidth={1.5} />,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-y-auto bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-white h-dvh">
      <NativeRedirect lang={lang} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse at top, black 40%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at top, black 40%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/70 p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.6)_inset,0_20px_60px_-20px_rgba(15,23,42,0.25)] backdrop-blur-xl dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_20px_60px_-20px_rgba(0,0,0,0.6)] sm:p-12">
          <div className="flex gap-1 items-center">
            {/* Decorative pixel cluster */}
            <div aria-hidden className="me-2 my-2 w-28">
              <img
                src="/icon-512x512.png"
                alt=""
                height={256}
                width={256}
                className="h-full w-full scale-125"
              />
            </div>
            <div className="inline-flex items-center p-1 px-2 text-xs rounded-full font-semibold uppercase tracking-[0.18em] backdrop-blur dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300">
              MineSkin.pro
            </div>
          </div>
          <div className="relative max-w-2xl">
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {home.heroTitle1}
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 bg-linear-to-br from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent dark:from-blue-300 dark:via-blue-400 dark:to-indigo-300">
                  {home.heroTitle2}
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-blue-200/60 dark:bg-blue-500/20"
                />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-lg">
              {home.heroDescription}{" "}
              <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                {home.heroFree}
              </span>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={`/${lang}/preview`}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 active:scale-[0.98] dark:shadow-blue-500/20"
              >
                <span className="absolute inset-0 -translate-x-full from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                {home.openApp}
                <ArrowRight className="h-4 w-4 transition-transform" />
              </Link>
              <a
                href="#support"
                className="group inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-neutral-800/60"
              >
                {home.supportBadge}
                <Heart className="h-4 w-4 text-rose-500 transition-transform group-hover:scale-110" />
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                {home.whatsInside}
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                {home.featuresHeading}
              </h2>
            </div>
            <div className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700 sm:block" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature) => (
              <article
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all  hover:border-blue-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-500/50"
              >
                <div
                  aria-hidden
                  className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/5 blur-2xl transition-all group-hover:bg-blue-500/15 dark:bg-blue-400/10"
                />
                <div className="relative flex items-center justify-between">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100 transition-transform group-hover:scale-110 group-hover:-rotate-3 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20">
                    {feature.glyph}
                  </div>
                </div>
                <h3 className="relative mt-5 text-lg font-semibold leading-snug">
                  {feature.title}
                </h3>
                <p className="relative mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Support CTA */}
        <section
          id="support"
          className="relative scroll-mt-24 overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-white via-white to-blue-50/50 p-6 shadow-sm dark:border-neutral-800 dark:from-neutral-900 dark:via-neutral-900 dark:to-blue-950/30 sm:p-10 mb-12"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 50%, rgba(59,130,246,0.15), transparent 60%)",
            }}
          />

          <div className="relative">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                <Sparkles className="h-3 w-3" />
                {home.supportBadge}
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {home.supportHeading1} <br className="sm:hidden" />
                <span className="text-blue-600 dark:text-blue-400">
                  {home.supportHeading2}
                </span>
              </h2>
              <p className="mt-4 text-sm leading-6 text-neutral-600 dark:text-neutral-300 sm:text-base">
                {home.supportDescription}
              </p>
            </div>

            {/* Two distinct ways to help — kept visually separate so the
                install-the-app ask never blurs into the tip-the-dev ask. */}
            <div className="mt-8 grid overflow-hidden rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/40 sm:grid-cols-2">
              <div className="border-b border-neutral-200 p-6 dark:border-neutral-800 sm:border-b-0 sm:border-r">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20">
                    <Smartphone className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <h3 className="text-sm font-semibold">
                    {home.supportAppTitle}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                  {home.supportAppText}
                </p>
                <StoreBadges
                  source="home"
                  size="sm"
                  appStoreAlt={home.appStoreAlt}
                  playStoreAlt={home.playStoreAlt}
                  className="mt-4"
                />
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-100 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20">
                    <Coffee className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <h3 className="text-sm font-semibold">
                    {home.supportTipTitle}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                  {home.supportTipText}
                </p>
                <CoffeeButton
                  source="home"
                  label={home.buyMeACoffee}
                  className="mt-4"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
