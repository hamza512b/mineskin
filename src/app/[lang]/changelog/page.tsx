import { getDocBySlug } from "@/utils/docs";
import markdownToHtml from "@/utils/markdonwToHtml";
import { getTableOfContents } from "@/utils/toc";
import {
  TableOfContents,
  TableOfContentsType,
} from "@/widgets/tableOfContents";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { locales, generateAlternates, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChangelogPageProps {
  params: Promise<{
    lang: string;
  }>;
}

interface ChangelogData {
  content: string;
  html: string;
  toc: TableOfContentsType;
}

// Unlike guides/policies there is only ever one changelog document, so the
// slug is fixed and the route has no [slug] segment. The English file is a
// symlink to the repo-root CHANGELOG.md, which stays the single source of
// truth; readFileSync follows it.
const CHANGELOG_SLUG = "changelog";

async function getChangelogData(lang: string): Promise<ChangelogData | null> {
  const changelog = getDocBySlug(
    CHANGELOG_SLUG,
    ["content"],
    `changelog`,
    lang,
  );

  if (!changelog || !changelog.content) {
    return null;
  }

  const html = await markdownToHtml(changelog.content);
  // getTableOfContents lives in untyped JS (src/utils/toc.js); its inferred
  // return type doesn't line up with TableOfContentsType, so narrow it here.
  const toc = (await getTableOfContents(
    changelog.content,
  )) as TableOfContentsType;

  return {
    content: changelog.content,
    html,
    toc,
  };
}

export async function generateMetadata({
  params,
}: ChangelogPageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return {
    title: dict.changelog.title,
    description: dict.changelog.pageDescription,
    alternates: generateAlternates("/changelog", lang as Locale),
  };
}

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function ChangelogPage({ params }: ChangelogPageProps) {
  const { lang } = await params;
  const changelog = await getChangelogData(lang);
  const dict = await getDictionary(lang as Locale);

  if (!changelog) {
    notFound();
  }

  return (
    <div className="h-dvh overflow-y-auto">
      <div className="container relative mx-auto max-w-5xl px-6 py-6 lg:grid lg:grid-cols-[1fr_300px] lg:gap-10 lg:py-10 xl:gap-20">
        <article>
          <div className="mb-6">
            <Link
              href={`/${lang}/preview`}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2 rtl:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {dict.common.backToHome}
            </Link>
          </div>
          <div className={"space-y-4"}>
            <h1 className="inline-block text-4xl font-black tracking-tight dark:text-white text-neutral-900 lg:text-5xl">
              {dict.changelog.title}
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              {dict.changelog.pageDescription}
            </p>
            {/* The Discord server is English-only, so the invite is shown on
                the English page only — same rule the settings panel follows. */}
            {lang === "en" && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {dict.changelog.helpText}{" "}
                <a
                  href="https://discord.gg/2egvhmqdza"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {dict.changelog.discord}
                </a>
              </p>
            )}
          </div>
          <hr className="my-4 border-neutral-200" />
          <div className="prose prose-blue prose-headings:scroll-m-20 dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: changelog.html }} />
          </div>
        </article>
        <div className="hidden text-sm lg:block">
          <div className="sticky top-8 -mt-10 pt-10">
            <ScrollArea className="h-[calc(100dvh-8rem)]">
              <TableOfContents
                toc={changelog.toc}
                title={dict.policies.tableOfContents}
              />
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
