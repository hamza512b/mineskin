import { remark } from "remark";
import htmlRemark from "remark-html";
import { rehype } from "rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export default async function markdownToHtml(markdown: string) {
  const html = await remark().use(htmlRemark).process(markdown);
  const result = await rehype()
    .data("settings", { fragment: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .process(html);
  return result.toString();
}
