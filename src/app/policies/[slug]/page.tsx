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

interface PolicyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface PolicyData {
  title: string;
  slug: string;
  content: string;
  description: string;
  html: string;
  toc: TableOfContentsType;
}

async function getPolicyData(slug: string): Promise<PolicyData | null> {
  const policy = getDocBySlug(
    slug,
    ["title", "slug", "content", "description"],
    `policies`,
    "en",
  );

  if (!policy || !policy.content) {
    return null;
  }

  const html = await markdownToHtml(policy.content);
  const toc = await getTableOfContents(policy.content);

  return {
    ...policy,
    html,
    toc,
  };
}

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const policy = await getPolicyData(slug);

  if (!policy) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: policy.title,
    description: policy.description,
  };
}

export async function generateStaticParams() {
  const policies = getAllDocs(["slug"], "policies", ["en"]);

  return policies.map((policy) => ({
    slug: policy.slug,
  }));
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = await params;
  const policy = await getPolicyData(slug);

  if (!policy) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="container relative mx-auto px-6 py-6 lg:grid lg:grid-cols-[1fr_300px] lg:gap-10 lg:py-10 xl:gap-20">
        <article>
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-4 w-4"
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
              Back to Home
            </Link>
          </div>
          <div className={"space-y-4"}>
            <h1 className="inline-block text-4xl font-black tracking-tight dark:text-white text-slate-900 lg:text-5xl">
              {policy.title}
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              {policy.description}
            </p>
          </div>
          <hr className="my-4 border-slate-200" />
          <div className="prose prose-blue prose-headings:scroll-m-20 dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: policy.html }} />
          </div>{" "}
        </article>
        <div className="hidden text-sm lg:block">
          <div className="sticky top-8 -mt-10 max-h-[calc(var(--vh)-4rem)] overflow-y-auto pt-10">
            <TableOfContents toc={policy.toc} />
          </div>
        </div>
      </div>
    </div>
  );
}

