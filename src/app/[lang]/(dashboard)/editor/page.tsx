import { Metadata } from "next";
import { generateAlternates, hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import EditorClient from "./EditorClient";

interface EditorPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: EditorPageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "en";
  const dict = await getDictionary(locale);
  const alternates = generateAlternates("/editor", locale);

  return {
    title: dict.metadata.editorTitle ?? `${dict.metadata.title} - Editor`,
    description: dict.metadata.editorDescription ?? dict.metadata.description,
    alternates,
  };
}

export default function EditorPage() {
  return <EditorClient />;
}
