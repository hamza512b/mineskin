import { generateAlternates, hasLocale, type Locale } from "@/i18n";
import { getDictionary } from "@/i18n/dictionaries";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportProblemForm } from "./ReportProblemForm";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "en";
  const dict = await getDictionary(locale as Locale);

  return {
    title: dict.reportProblem.pageTitle,
    description: dict.reportProblem.pageDescription,
    alternates: generateAlternates("/report-problem", locale as Locale),
  };
}

export default async function ReportProblemPage({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <main className="relative min-h-screen bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <div className="mx-auto max-w-xl px-4 py-12 sm:py-20">
        <ReportProblemForm lang={lang} />
      </div>
    </main>
  );
}
