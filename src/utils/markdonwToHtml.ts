import { remark } from "remark";
import htmlRemark from "remark-html";
import { rehype } from "rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import fs from "fs/promises";

export default async function markdownToHtml(markdown: string) {
  const html = await remark().use(htmlRemark).process(markdown);
  const result = await rehype()
    .data("settings", { fragment: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .process(html);
  return result.toString();
}

export async function markdownFileToHtml(file: string) {
  const makrdown = await fs.readFile(file, "utf-8");
  return await markdownToHtml(makrdown);
}
