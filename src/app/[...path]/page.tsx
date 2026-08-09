import { getAllDocs } from "@/utils/docs";
import { defaultLocale, hasLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import LocaleRedirect from "@/components/LocaleRedirect";

export async function generateStaticParams() {
  const paths: { path: string[] }[] = [
    { path: ["home"] },
    { path: ["preview"] },
    { path: ["editor"] },
    { path: ["report-problem"] },
    { path: ["changelog"] },
  ];

  const guides = getAllDocs(["slug"], "guides", [defaultLocale]);
  for (const guide of guides) {
    paths.push({ path: ["guides", guide.slug] });
  }

  const policies = getAllDocs(["slug"], "policies", [defaultLocale]);
  for (const policy of policies) {
    paths.push({ path: ["policies", policy.slug] });
  }

  return paths;
}

export default async function CatchAllRedirectPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;

  // If the path already begins with a valid locale, it's a genuine unknown
  // page under a real locale (e.g. /en/as/as) — not something to re-prefix.
  // Re-prefixing here would loop forever (/en/as/as → /en/en/as/as → …).
  if (path?.length && hasLocale(path[0])) {
    notFound();
  }

  return <LocaleRedirect />;
}
