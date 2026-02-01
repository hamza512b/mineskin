import { Metadata } from "next";
import { generateAlternates, hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import PreviewClient from "./PreviewClient";

interface PreviewPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: PreviewPageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "en";
  const dict = await getDictionary(locale);
  const alternates = generateAlternates("/preview", locale);

  return {
    title: dict.metadata.previewTitle ?? `${dict.metadata.title} - Preview`,
    description: dict.metadata.previewDescription ?? dict.metadata.description,
    alternates,
  };
}

export default function PreviewPage() {
  return <PreviewClient />;
}
