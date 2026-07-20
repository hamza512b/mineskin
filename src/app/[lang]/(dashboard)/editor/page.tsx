import { generateAlternates, hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Metadata, Viewport } from "next";
import EditorClient from "./EditorClient";

interface EditorPageProps {
  params: Promise<{ lang: string }>;
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

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
  return (
    <>
      {/* <AppInstallBanner /> */}
      <EditorClient />
    </>
  );
}
