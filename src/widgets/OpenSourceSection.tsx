"use client";

import {
  CONTACT_EMAIL,
  DISCORD_INVITE_URL,
  GITHUB_REPO_SLUG,
  GITHUB_REPO_URL,
  GITHUB_STARGAZERS_URL,
  REDDIT_LABEL,
  REDDIT_URL,
} from "@/lib/communityLinks";
import { useDictionary } from "@/i18n";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const STARS_CACHE_KEY = "mineskin:github-stars";
/** Unauthenticated GitHub API calls are IP rate limited, so reuse for an hour. */
const STARS_CACHE_TTL_MS = 60 * 60 * 1000;

function readCachedStars(): number | null {
  try {
    const raw = sessionStorage.getItem(STARS_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { count?: number; at?: number };
    if (typeof cached.count !== "number" || typeof cached.at !== "number") {
      return null;
    }
    if (Date.now() - cached.at > STARS_CACHE_TTL_MS) return null;
    return cached.count;
  } catch {
    return null;
  }
}

function writeCachedStars(count: number) {
  try {
    sessionStorage.setItem(
      STARS_CACHE_KEY,
      JSON.stringify({ count, at: Date.now() }),
    );
  } catch {
    // Storage can be unavailable (private mode); the count is not worth failing over.
  }
}

/**
 * "MineSkin is open source" block: the GitHub star ask plus the community and
 * contact links. Client-side because the star count is fetched at runtime (the
 * site is a static export) and the email has a copy-to-clipboard button.
 */
export default function OpenSourceSection() {
  const { dictionary, locale } = useDictionary();
  const home = dictionary.home;
  const [stars, setStars] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const cached = readCachedStars();
    if (cached !== null) {
      setStars(cached);
      return;
    }

    const controller = new AbortController();
    fetch(`https://api.github.com/repos/${GITHUB_REPO_SLUG}`, {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const count = data?.stargazers_count;
        if (typeof count !== "number") return;
        setStars(count);
        writeCachedStars(count);
      })
      .catch(() => {
        // Offline or rate limited: the star button still works without a count.
      });

    return () => controller.abort();
  }, []);

  useEffect(
    () => () => {
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
    },
    [],
  );

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied: the address stays visible and selectable.
    }
  };

  const starsLabel =
    stars === null ? null : new Intl.NumberFormat(locale).format(stars);

  return (
    <section
      id="github"
      className="flex scroll-mt-24 flex-col gap-6 border-t border-neutral-200 pt-10 dark:border-neutral-800"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            {home.openSourceHeading}
          </h2>
          <p className="mt-1.5 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
            {home.openSourceDescription}
          </p>
        </div>

        <div className="flex w-full shrink-0 items-stretch overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 sm:w-auto">
          <Link
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              window.gtag?.("event", "github_visit", { source: "home" })
            }
            className="inline-flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 active:scale-[0.98] dark:text-neutral-100 dark:hover:bg-neutral-800 sm:flex-none sm:justify-start"
          >
            <GitHubIcon />
            {home.githubStar}
          </Link>
          <a
            href={GITHUB_STARGAZERS_URL}
            target="_blank"
            rel="noopener noreferrer"
            title={home.githubStargazers}
            className="flex items-center justify-center border-s border-neutral-200 px-4 text-sm font-semibold text-neutral-800 tabular-nums transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            {starsLabel ?? (
              <span
                aria-hidden
                className="text-neutral-400 dark:text-neutral-500"
              >
                &mdash;
              </span>
            )}
            <span className="sr-only">{home.githubStargazers}</span>
          </a>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-neutral-200/70 pt-6 text-sm dark:border-neutral-800/60">
        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <DiscordIcon />
          Discord
        </a>
        <a
          href={REDDIT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <RedditIcon />
          {REDDIT_LABEL}
        </a>

        <div className="flex w-full min-w-0 items-center gap-2.5 sm:ms-auto sm:w-auto">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="min-w-0 truncate text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            {CONTACT_EMAIL}
          </a>
          <button
            type="button"
            onClick={copyEmail}
            aria-label={home.copyEmailLabel}
            className="shrink-0 cursor-pointer rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-semibold text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-white"
          >
            {copied ? home.copiedEmail : home.copyEmail}
          </button>
        </div>
      </div>
    </section>
  );
}

function GitHubIcon() {
  return (
    <svg
      aria-hidden
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg
      aria-hidden
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg
      aria-hidden
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z" />
    </svg>
  );
}
