"use client";
import * as React from "react";

interface Item {
  title: string;
  url: string;
  items?: Item[];
}

interface Items {
  items?: Item[];
}

export type TableOfContentsType = Items;

interface TocProps {
  toc: TableOfContentsType;
  title?: string;
}

export function TableOfContents({ toc, title = "Table of contents" }: TocProps) {
  const itemIds = React.useMemo(
    () =>
      toc.items
        ? toc.items
            .flatMap((item) => [item.url, item?.items?.map((item) => item.url)])
            .flat()
            .filter(Boolean)
            .map((id) => id?.split("#")[1] || "")
        : [],
    [toc],
  );
  const activeHeading = useActiveItem(itemIds);
  const mounted = useMounted();
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!activeHeading || !containerRef.current) return;
    const link = containerRef.current.querySelector<HTMLAnchorElement>(
      `a[href="#${CSS.escape(activeHeading)}"]`,
    );
    if (!link) return;
    const scroller =
      link.closest<HTMLElement>("[data-radix-scroll-area-viewport]") ??
      link.closest<HTMLElement>(".overflow-y-auto") ??
      containerRef.current;
    const linkRect = link.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    if (linkRect.top < scrollerRect.top || linkRect.bottom > scrollerRect.bottom) {
      link.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeHeading]);

  if (!toc?.items) {
    return <></>;
  }

  return mounted ? (
    <div ref={containerRef} className="space-y-2">
      <p className="font-medium">{title}</p>
      <Tree tree={toc} activeItem={activeHeading} />
    </div>
  ) : (
    <></>
  );
}

function useActiveItem(itemIds: string[]) {
  const [activeId, setActiveId] = React.useState<string>();

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: `0% 0% -80% 0%` },
    );

    itemIds?.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      itemIds?.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [itemIds]);

  return activeId;
}

export function useMounted() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

interface TreeProps {
  tree: TableOfContentsType;
  level?: number;
  activeItem?: string;
}

function Tree({ tree, level = 1, activeItem }: TreeProps) {
  return tree?.items?.length && level < 3 ? (
    <ul className={`m-0 list-none ${level !== 1 ? "pl-4" : ""}`}>
      {tree.items.map((item, index) => {
        return (
          <li key={index} className={"mt-0 pt-2"}>
            <a
              href={item.url}
              className={`inline-block no-underline ${
                item.url === `#${activeItem}`
                  ? "text-state-900 dark:text-white font-medium"
                  : "text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {item.title}
            </a>
            {item.items?.length ? (
              <Tree tree={item} level={level + 1} activeItem={activeItem} />
            ) : null}
          </li>
        );
      })}
    </ul>
  ) : null;
}
