#!/usr/bin/env node
// Generate the native platforms' localized strings from the web app's
// dictionaries, so `src/i18n/locales/*.json` stays the single source of truth
// for every user-facing string — including the ones the OS renders outside the
// WebView, which the React tree can never reach.
//
// Today that means the iOS permission prompts: an `<input type="file">` in the
// reference-images panel lets iOS offer "Take Photo", and iOS kills any app
// that starts a capture session without NSCameraUsageDescription in Info.plist.
// The prompt is shown by the system, in the *device's* language, so shipping
// only the English key means Arabic/Chinese/Spanish/Portuguese users get an
// English sentence in a system alert.
//
// Outputs (all generated — never hand-edit):
//   ios/App/App/<locale>.lproj/InfoPlist.strings        localized Info.plist keys
//   ios/App/App/Info.plist                              English values, kept in sync
//   android/app/src/main/res/values[-qual]/native_strings.xml
//
// The Android file is a separate resource file (not Capacitor's strings.xml) so
// generation and `npx cap sync` can never clobber each other.
//
// Usage:
//   node scripts/generate-native-strings.mjs            write the files
//   node scripts/generate-native-strings.mjs --check    verify they're up to date (CI)
//
// Runs automatically from scripts/build-and-sync.sh before every native build.
//
// Adding a string: add the key to `src/i18n/locales/en.json`, translate it into
// every locale (see the translation workflow in AGENTS.md), then add a row to
// NATIVE_STRINGS below.
//
// Adding a locale: add it to LOCALE_TARGETS below, then register the new
// `<locale>.lproj/InfoPlist.strings` in the Xcode project (variant group +
// knownRegions). This script fails loudly if either step is missing — an
// unregistered .lproj is silently dropped from the app bundle at build time.
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  existsSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, relative } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const localesDir = resolve(root, "src/i18n/locales");
const iosAppDir = resolve(root, "ios/App/App");
const infoPlistPath = resolve(iosAppDir, "Info.plist");
const pbxPath = resolve(root, "ios/App/App.xcodeproj/project.pbxproj");
const androidResDir = resolve(root, "android/app/src/main/res");

/**
 * The strings the native shells need, and where each one lands.
 *
 * `key`          dotted path into the locale JSON
 * `infoPlistKey` iOS Info.plist key, or null to skip iOS
 * `androidName`  Android string resource name, or null to skip Android
 */
const NATIVE_STRINGS = [
  {
    key: "native.cameraUsageDescription",
    infoPlistKey: "NSCameraUsageDescription",
    // Nothing on Android reads this yet: the manifest declares no CAMERA
    // permission, so the WebView file chooser hands off to the camera app by
    // intent and Android never shows a rationale. Generated anyway so a future
    // runtime-permission dialog has a translated string to use.
    androidName: "camera_usage_description",
  },
];

/**
 * Per-locale output directories. iOS and Android each have their own spelling
 * of a locale, and neither matches the web app's:
 *   zh    -> zh-Hans (iOS) / zh-rCN (Android): both mean Simplified Chinese
 *   pt-BR -> pt-BR   (iOS) / pt-rBR (Android)
 * `androidValues: "values"` marks the default (unqualified) resource folder.
 */
const LOCALE_TARGETS = {
  en: { lproj: "en.lproj", androidValues: "values" },
  ar: { lproj: "ar.lproj", androidValues: "values-ar" },
  zh: { lproj: "zh-Hans.lproj", androidValues: "values-zh-rCN" },
  es: { lproj: "es.lproj", androidValues: "values-es" },
  "pt-BR": { lproj: "pt-BR.lproj", androidValues: "values-pt-rBR" },
};

/** The locale whose values go into Info.plist and the default `values/` folder. */
const DEFAULT_LOCALE = "en";

const GENERATED_BY = "scripts/generate-native-strings.mjs";
const checkOnly = process.argv.includes("--check");

const fail = (message, ...details) => {
  console.error(`generate-native-strings: ${message}`);
  for (const line of details) console.error(`  ${line}`);
  process.exit(1);
};

// --- read the dictionaries -------------------------------------------------

const localeFiles = readdirSync(localesDir)
  .filter((name) => name.endsWith(".json"))
  .map((name) => name.slice(0, -".json".length))
  .sort();

const unmapped = localeFiles.filter((locale) => !(locale in LOCALE_TARGETS));
if (unmapped.length > 0) {
  fail(
    `no native output mapping for locale(s): ${unmapped.join(", ")}`,
    `Add them to LOCALE_TARGETS in ${GENERATED_BY}, then register the new`,
    ".lproj in ios/App/App.xcodeproj/project.pbxproj (variant group + knownRegions).",
  );
}
if (!localeFiles.includes(DEFAULT_LOCALE)) {
  fail(
    `missing the default locale dictionary src/i18n/locales/${DEFAULT_LOCALE}.json`,
  );
}

/** Resolves a dotted key against a dictionary; returns undefined if absent. */
const lookup = (dict, key) =>
  key
    .split(".")
    .reduce((node, part) => (node == null ? undefined : node[part]), dict);

/** locale -> { <dotted key>: <string> } */
const values = {};
const missing = [];
for (const locale of localeFiles) {
  const dict = JSON.parse(
    readFileSync(resolve(localesDir, `${locale}.json`), "utf8"),
  );
  values[locale] = {};
  for (const { key } of NATIVE_STRINGS) {
    const value = lookup(dict, key);
    if (typeof value !== "string" || value.trim() === "") {
      missing.push(`${locale}.json → ${key}`);
      continue;
    }
    values[locale][key] = value;
  }
}
if (missing.length > 0) {
  fail(
    "the native strings are missing from some dictionaries:",
    ...missing,
    "Translate them before building — an untranslated locale would ship an English system prompt.",
  );
}

// --- writers ---------------------------------------------------------------

/** Files this run wants on disk: absolute path -> contents. */
const outputs = new Map();

const stamp = (comment) =>
  `${comment} Generated by ${GENERATED_BY} — do not edit.`;

// .strings is a C-like format: only backslashes, double quotes and newlines
// need escaping. The file itself is UTF-8 (Xcode's default since Xcode 10).
const escapeStrings = (value) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");

for (const locale of localeFiles) {
  const entries = NATIVE_STRINGS.filter((s) => s.infoPlistKey);
  if (entries.length === 0) break;

  const body = entries
    .map(
      ({ key, infoPlistKey }) =>
        `/* ${key} */\n"${infoPlistKey}" = "${escapeStrings(values[locale][key])}";`,
    )
    .join("\n\n");

  outputs.set(
    resolve(iosAppDir, LOCALE_TARGETS[locale].lproj, "InfoPlist.strings"),
    `${stamp("/*")} */\n/* Source: src/i18n/locales/${locale}.json */\n\n${body}\n`,
  );
}

// Android string resources. Escaping rules differ from XML's: apostrophes and
// quotes must be backslash-escaped, and a leading @ or ? would be read as a
// resource reference.
const escapeAndroid = (value) => {
  const escaped = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
  return /^[@?]/.test(escaped) ? `\\${escaped}` : escaped;
};

for (const locale of localeFiles) {
  const entries = NATIVE_STRINGS.filter((s) => s.androidName);
  if (entries.length === 0) break;

  const body = entries
    .map(
      ({ key, androidName }) =>
        `    <string name="${androidName}">${escapeAndroid(values[locale][key])}</string>`,
    )
    .join("\n");

  outputs.set(
    resolve(
      androidResDir,
      LOCALE_TARGETS[locale].androidValues,
      "native_strings.xml",
    ),
    `<?xml version="1.0" encoding="utf-8"?>\n${stamp("<!--")} -->\n<!-- Source: src/i18n/locales/${locale}.json -->\n<resources>\n${body}\n</resources>\n`,
  );
}

// Info.plist holds the English values: a localized InfoPlist.strings only
// *overrides* a key that already exists there, and App Review reads this file.
{
  const plist = readFileSync(infoPlistPath, "utf8");
  const escapeXml = (value) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  let next = plist;
  for (const { key, infoPlistKey } of NATIVE_STRINGS) {
    if (!infoPlistKey) continue;
    const value = escapeXml(values[DEFAULT_LOCALE][key]);
    // The <string> belonging to a <key> is the next element after it.
    const existing = new RegExp(
      `(<key>${infoPlistKey}</key>\\s*\\n\\s*<string>)[\\s\\S]*?(</string>)`,
    );
    if (existing.test(next)) {
      next = next.replace(existing, `$1${value}$2`);
    } else {
      // Keep the file's tab indentation and append just before </dict>.
      next = next.replace(
        /(\n)(<\/dict>\s*<\/plist>)/,
        `$1\t<key>${infoPlistKey}</key>\n\t<string>${value}</string>\n$2`,
      );
    }
  }
  outputs.set(infoPlistPath, next);
}

// --- Xcode registration guard ----------------------------------------------
//
// Xcode copies a .lproj into the bundle only if the project references it.
// A generated-but-unregistered file looks fine in git and silently does
// nothing at runtime, so treat it as a hard error rather than a warning.
{
  const pbx = readFileSync(pbxPath, "utf8");
  const unregistered = localeFiles.filter(
    (locale) =>
      !pbx.includes(`${LOCALE_TARGETS[locale].lproj}/InfoPlist.strings`),
  );
  // knownRegions gates whether Xcode treats the folder as a localization.
  const regions = pbx.match(/knownRegions = \(([\s\S]*?)\);/)?.[1] ?? "";
  const unknownRegions = localeFiles.filter((locale) => {
    const region = LOCALE_TARGETS[locale].lproj.replace(/\.lproj$/, "");
    return !new RegExp(`(^|[\\s"(])${region}[,"]`).test(regions);
  });

  if (unregistered.length > 0 || unknownRegions.length > 0) {
    fail(
      "the Xcode project is missing localizations:",
      ...unregistered.map(
        (l) =>
          `${LOCALE_TARGETS[l].lproj}/InfoPlist.strings is not in the InfoPlist.strings variant group`,
      ),
      ...unknownRegions.map(
        (l) =>
          `${LOCALE_TARGETS[l].lproj.replace(/\.lproj$/, "")} is not in knownRegions`,
      ),
      "Open ios/App/App.xcodeproj and add the file/region, or copy an existing entry in project.pbxproj.",
    );
  }
}

// --- write or check --------------------------------------------------------

const stale = [];
for (const [path, contents] of outputs) {
  const current = existsSync(path) ? readFileSync(path, "utf8") : null;
  if (current === contents) continue;
  stale.push(relative(root, path));
  if (!checkOnly) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, contents, "utf8");
  }
}

if (checkOnly) {
  if (stale.length > 0) {
    fail(
      "the generated native strings are out of date:",
      ...stale,
      "Run: npm run i18n:native",
    );
  }
  console.log(`generate-native-strings: up to date (${outputs.size} files).`);
} else {
  console.log(
    stale.length === 0
      ? `generate-native-strings: already up to date (${outputs.size} files).`
      : `generate-native-strings: wrote ${stale.length} file(s):\n  ${stale.join("\n  ")}`,
  );
}
