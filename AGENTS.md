# Agent Guide

MineSkin PRO is a Minecraft skin editor with a 3D preview. It is a Next.js 16 web
application exported fully statically, wrapped by Capacitor for the iOS and
Android apps. Rendering is a custom WebGL engine.

## Non-negotiable rules

- Do not create branches, open pull requests, push, or run `git stash`,
  `git checkout`, `git reset` or similar unless the user explicitly requests it.
  Work directly on the current branch. Never do git things on intuition; if
  unsure, consult me.
- Never run `fastlane`, any `release:*` script, or `version:bump` on your own
  initiative, these submit builds to the App Store / Google Play.
- All user-facing strings must be i18n'd. Add translation keys with the UI text
  and follow the translation workflow below.
- The app must remain a fully static export for building to web.
- Any change to the shape of persisted state (localStorage config, IndexedDB
  skins) needs a migration in `migrateConfig` so existing users' saved state
  stays valid.
- Never do things with git with your intuitive, if unsure please consult me.


## Repository map

| Path                                | Responsibility                                                           |
| ----------------------------------- | ------------------------------------------------------------------------ |
| `src/core`                          | Custom WebGL engine: renderer, skin model, meshes, input, undo, recorder |
| `src/core/backend`                  | WebGL1/WebGL2 program backends                                           |
| `src/store`                         | Zustand vanilla store: renderer config, undo history, persistence        |
| `src/i18n`                          | Dictionaries, locale config, per-language glossaries                     |
| `src/app`                           | Next.js App Router pages, `/[lang]/...` locale-prefixed routing          |
| `src/widgets`                       | Product UI: Toolbar, DetailPanel, dialogs, banners                       |
| `src/components`                    | Reusable UI primitives                                                   |
| `src/lib`, `src/hooks`, `src/utils` | Shared helpers, IndexedDB, theme                                         |
| `ios/`, `android/`                  | Capacitor native projects                                                |
| `fastlane/`                         | Store release automation (do not run unprompted)                         |
| `public/`                           | Static assets                                                            |

## Internationalization

5 languages: en, ar, zh, es, pt-BR. Locale detection order: cookie → navigator
→ default. `src/i18n/locales/en.json` is the source of truth, the `Dictionary`
type derives from it, so add or rename keys there first.

Per-language terminology glossaries live in `src/i18n/glossary/<locale>.md`
(`ar.md`, `zh.md`, `es.md`, `pt-BR.md`). Each is self-contained: that
language's canonical term per concept, its voice/register rules, and the shared
verbatim-brand/placeholder rules.

**Translation workflow (required):**

- When translating or changing any user-facing string, **spawn one subagent per
  non-English locale** (`ar`, `zh`, `es`, `pt-BR`), each acting as a native
  speaker for that language, and run them in parallel — do not translate all
  languages in a single pass. These translation subagents are **pre-authorized**:
  treat this as a standing request to spawn them, and do not ask first, even
  under a general instruction to avoid subagents unless explicitly asked. Give each subagent the English source
  (`locales/en.json`), the target `locales/<locale>.json`, and that language's
  glossary `glossary/<locale>.md`.
- **Keep the glossaries current.** Introducing a new term or changing a
  canonical translation ⇒ update the affected `glossary/<locale>.md` in the
  same change.
- **Invariants for every locale (validate after editing):** all locales keep
  identical key sets to `en.json` (no missing/extra), every `{{placeholder}}`
  is preserved verbatim, brand names stay verbatim in Latin (MineSkin PRO,
  Minecraft, iOS, Android, App Store, Google Play, GitHub, Discord, PNG),
  `languageSwitcher.*` endonyms are never changed, and each file remains valid
  2-space-indented JSON.

## Verification

The skin preview and painting happen on a WebGL canvas, which DOM-based browser
automation has hard time to deal wiht. For things you can not test reliably as this please consult me.

## Before finishing

- Check for affected call sites, persisted-state migrations, i18n key sets, and
  documentation.
