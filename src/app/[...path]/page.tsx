import { getAllDocs } from "@/utils/docs";
import { defaultLocale } from "@/i18n/config";
import LocaleRedirect from "@/components/LocaleRedirect";

export async function generateStaticParams() {
  const paths: { path: string[] }[] = [
    { path: ["preview"] },
    { path: ["editor"] },
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

export default function CatchAllRedirectPage() {
  return <LocaleRedirect />;
}
