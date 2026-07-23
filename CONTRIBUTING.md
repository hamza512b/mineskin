# Contributing to MineSkin PRO

Thank you for helping improve MineSkin PRO. Bug reports, feature ideas,
translations, documentation, and code contributions are all welcome.

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
Code and documentation contributions are also subject to the [Contributor
License Agreement](CLA.md).

## Report a bug

Search [existing issues](https://github.com/hamza512b/mineskin/issues) first,
then open a [bug report](https://github.com/hamza512b/mineskin/issues/new?template=bug_report.yml).
Include:

- Clear steps to reproduce the problem
- The expected and actual behavior
- Platform, browser or app version, and device details
- Screenshots, recordings, or console output when useful

Do not report vulnerabilities publicly. Follow [SECURITY.md](SECURITY.md)
instead.

## Suggest a feature

Use the [feature request](https://github.com/hamza512b/mineskin/issues/new?template=feature_request.yml)
form. Explain the user problem, the outcome you want, and any alternatives or
mockups you considered.

## Submit a change

1. Fork the repository.
2. Create a focused branch from `main` in your fork.
3. Make and verify your changes.
4. Push the branch to your fork and open a pull request.
5. Complete the pull-request checklist, including the CLA agreement.

Keep pull requests limited to one coherent change. Link related issues and
describe both what changed and how you tested it.

## Development setup

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer
- npm; commit changes to `package-lock.json` when dependencies change

### Run the web app

```bash
git clone https://github.com/<your-user>/mineskin.git
cd mineskin
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Verify changes

Run the checks relevant to your change:

```bash
npm run lint
npm run build
npx prettier --check .
```

The preview and painting surface use WebGL, so manually verify visual and input
changes in the browsers or native platforms they affect. Include those checks
in the pull request's testing plan.

## Project structure

```text
src/core/        Custom WebGL renderer, model, tools, input, undo, recorder
src/store/       Zustand state, history, and persistence
src/app/         Next.js routes, including locale-prefixed pages
src/widgets/     Product UI
src/components/  Reusable UI primitives
src/i18n/        Dictionaries, locale configuration, and glossaries
ios/             Capacitor iOS project
android/         Capacitor Android project
public/          Static assets
```

Read [AGENTS.md](AGENTS.md) before making a change. Its repository invariants
apply to every contribution, including:

- Keep builds compatible with the app's static export.
- Add a migration when changing persisted configuration or IndexedDB data.
- Do not run release or store-submission commands as part of development.

## Internationalization

Do not hardcode user-facing text. English in `src/i18n/locales/en.json` is the
source of truth, and every locale must retain the same keys and placeholders.
Update Arabic, Chinese, Spanish, and Brazilian Portuguese alongside English and
follow each locale's glossary in `src/i18n/glossary/`.

Brand names such as MineSkin PRO, Minecraft, iOS, Android, App Store, Google
Play, GitHub, Discord, and PNG remain verbatim. Do not change the
language-switcher endonyms.

## Code style

- Use TypeScript for application code.
- Follow the existing component and module patterns.
- Prefer focused functions and comments that explain non-obvious decisions.
- Avoid unrelated formatting or refactoring in the same pull request.

## Licensing

MineSkin PRO is available under the [GNU AGPL-3.0](LICENSE) and is also
offered separately under commercial terms. All contributions require agreement
to the [CLA](CLA.md). The CLA is a license, not a copyright assignment: you keep
ownership of your contribution while allowing the project owner to distribute
it under the project's open-source and commercial licenses.
