import fs from "fs";
import { join } from "path";
import matter from "gray-matter";

function getDocSlugs(guidesDirectory) {
  const slugs = fs
    .readdirSync(guidesDirectory)
    .map((slug) => slug.replace(/(\.[A-z0-9-]+?)?\.md$/, ""));
  return Array.from(new Set(slugs));
}
/**
 * Returns the sum of a and b
 * @returns {any}
 */
export function getDocBySlug(slug, fields = [], directory, locale) {
  let fileContents;
  try {
    fileContents = fs.readFileSync(
      join(process.cwd(), directory, `${slug}.${locale}.md`),
      "utf8",
    );
  } catch {
    try {
      fileContents = fs.readFileSync(
        join(process.cwd(), directory, `${slug}.en.md`),
        "utf8",
      );
    } catch {
      return null;
    }
  }
  const { data, content } = matter(fileContents);

  const items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (typeof data[field] !== "undefined") {
      items[field] = data[field];
    }
    if (field === "slug") {
      items[field] = slug;
    }
    if (field === "content") {
      items[field] = content;
    }

    if (field === "date") {
      items[field] = data[field] && data[field].getTime();
    }
  });

  return items;
}

export function getAllDocs(fields = [], directory, locales) {
  const slugs = getDocSlugs(join(process.cwd(), directory));
  const guides = slugs
    .map((slug) =>
      locales.map((locale) => getDocBySlug(slug, fields, directory, locale)),
    )
    .flat()
    .filter(Boolean)
    .sort((guide1, guide2) => (guide1.date > guide2.date ? -1 : 1));
  return guides;
}
