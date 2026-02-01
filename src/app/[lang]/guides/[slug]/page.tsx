import { getAllDocs, getDocBySlug } from "@/utils/docs";
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

interface GuidePageProps {
  params: Promise<{
    slug: string;
    lang: string;
  }>;
}

interface GuideData {
  title: string;
  slug: string;
  content: string;
  description: string;
  html: string;
  toc: TableOfContentsType;
}

async function getGuideData(
  slug: string,
  lang: string,
): Promise<GuideData | null> {
  const guide = getDocBySlug(
    slug,
    ["title", "slug", "content", "description"],
    `guides`,
    lang,
  );

  if (!guide || !guide.content) {
    return null;
  }

  const html = await markdownToHtml(guide.content);
  const toc = await getTableOfContents(guide.content);

  return {
    ...guide,
    html,
    toc,
  };
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug, lang } = await params;
  const guide = await getGuideData(slug, lang);
  const dict = await getDictionary(lang as Locale);

  if (!guide) {
    return {
      title: dict.common.notFound,
    };
  }

  const alternates = generateAlternates(`/guides/${slug}`, lang as Locale);

  return {
    title: guide.title,
    description: guide.description,
    alternates,
  };
}

export async function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];

  for (const lang of locales) {
    const guides = getAllDocs(["slug"], "guides", [lang]);
    for (const guide of guides) {
      params.push({ lang, slug: guide.slug });
    }
  }

  return params;
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug, lang } = await params;
  const guide = await getGuideData(slug, lang);
  const dict = await getDictionary(lang as Locale);

  if (!guide) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="container relative mx-auto px-6 py-6 lg:grid lg:grid-cols-[1fr_300px] lg:gap-10 lg:py-10 xl:gap-20">
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
            <h1 className="inline-block text-4xl font-black tracking-tight dark:text-white text-slate-900 lg:text-5xl">
              {guide.title}
            </h1>
            {guide.description && (
              <p className="text-xl text-slate-600 dark:text-slate-400">
                {guide.description}
              </p>
            )}
          </div>
          <hr className="my-4 border-slate-200" />
          <div className="prose prose-blue prose-headings:scroll-m-20 dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: guide.html }} />
          </div>{" "}
        </article>
        <div className="hidden text-sm lg:block">
          <div className="sticky top-8 -mt-10 max-h-[calc(var(--vh)-4rem)] overflow-y-auto pt-10">
            <TableOfContents toc={guide.toc} title={dict.policies.tableOfContents} />
          </div>
        </div>
      </div>
    </div>
  );
}
