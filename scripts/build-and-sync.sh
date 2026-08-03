#!/usr/bin/env bash
#
# Build the web app and sync it into a native platform.
#
# Invoked automatically before a native build:
#   - iOS:     an Xcode "Build & sync web" run-script build phase
#   - Android: the `mineskinWebBuildAndSync` Gradle task (preBuild dependency)
#
# Usage: build-and-sync.sh <ios|android>
#
# Set MINESKIN_SKIP_WEB_BUILD=1 to skip (e.g. CI that builds the web bundle in a
# separate step, or to avoid a double build).
set -euo pipefail

PLATFORM="${1:-}"
if [[ "$PLATFORM" != "ios" && "$PLATFORM" != "android" ]]; then
  echo "build-and-sync.sh: expected platform 'ios' or 'android', got '$PLATFORM'" >&2
  exit 1
fi

if [[ "${MINESKIN_SKIP_WEB_BUILD:-}" == "1" ]]; then
  echo "build-and-sync.sh: MINESKIN_SKIP_WEB_BUILD=1, skipping web build + sync"
  exit 0
fi

# The web app lives one level up from this script's directory (scripts -> repo root).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Native build tools (Xcode, Gradle) run with a minimal PATH that excludes
# version-manager shims, so locate node before doing anything else.
ensure_node_on_path() {
  if command -v node >/dev/null 2>&1; then
    return
  fi

  # fnm — activate the default/used version.
  if command -v fnm >/dev/null 2>&1; then
    eval "$(fnm env)" 2>/dev/null || true
    (cd "$WEB_DIR" && fnm use --install-if-missing >/dev/null 2>&1) || true
  fi
  if command -v node >/dev/null 2>&1; then return; fi

  # nvm
  if [[ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]]; then
    # shellcheck disable=SC1091
    . "${NVM_DIR:-$HOME/.nvm}/nvm.sh" && nvm use --silent default >/dev/null 2>&1 || true
  fi
  if command -v node >/dev/null 2>&1; then return; fi

  # Common static install locations and version-manager shim dirs. fnm's
  # aliases/default comes before its multishells: the alias is stable, while
  # multishell dirs are per-shell leftovers that can point at stale versions.
  for dir in \
    "$HOME/.local/share/fnm/aliases/default/bin" \
    "$HOME/.volta/bin" \
    "$HOME/.asdf/shims" \
    "$HOME/.local/state/fnm_multishells"/*/bin \
    /opt/homebrew/bin \
    /usr/local/bin; do
    if [[ -x "$dir/node" ]]; then
      PATH="$dir:$PATH"
      break
    fi
  done

  # npm re-spawns shells for package scripts; without the export they inherit
  # the original PATH and die with "env: node: No such file or directory".
  export PATH

  if ! command -v node >/dev/null 2>&1; then
    echo "build-and-sync.sh: could not find 'node' on PATH." >&2
    echo "  Install Node, or set MINESKIN_SKIP_WEB_BUILD=1 to skip this step." >&2
    exit 1
  fi
}

ensure_node_on_path

echo "build-and-sync.sh: building web app and syncing '$PLATFORM' (node $(node -v))"
cd "$WEB_DIR"

# Regenerate the native localized strings (iOS InfoPlist.strings / Android
# native_strings.xml) from src/i18n/locales. These live outside the WebView, so
# nothing else would catch a dictionary change before it ships. Fails the build
# if a locale is untranslated or a new .lproj isn't registered in Xcode.
node scripts/generate-native-strings.mjs

# `cap copy` regenerates the native capacitor.config.json from
# capacitor.config.ts, which injects server.url from CAP_SERVER_URL — a dev
# convenience that must never reach a build unintentionally: a CAP_SERVER_URL
# `export` lingering in the shell that launched the IDE (or its Gradle daemon)
# silently points every build at a LAN dev server instead of the bundled
# export. So during native builds, live reload is strictly opt-in via
# MINESKIN_LIVE_RELOAD=1, never allowed in release builds, and an ambient
# CAP_SERVER_URL without the opt-in is dropped with a warning. Xcode exports
# CONFIGURATION (Debug/Release/...); Gradle passes MINESKIN_RELEASE_BUILD from
# the requested task names. Anything not clearly a debug build counts as
# release.
if [[ ("$PLATFORM" == "ios" && -n "${CONFIGURATION:-}" && "$CONFIGURATION" != "Debug") ||
      "${MINESKIN_RELEASE_BUILD:-}" == "1" ]]; then
  echo "build-and-sync.sh: release build — ignoring CAP_SERVER_URL (env and .env files)"
  # Exported-but-empty wins over .env values in capacitor.config.ts's loader.
  export CAP_SERVER_URL=""
elif [[ "${MINESKIN_LIVE_RELOAD:-}" == "1" ]]; then
  echo "build-and-sync.sh: live reload — WebView will load ${CAP_SERVER_URL:-the CAP_SERVER_URL from .env files}"
else
  if [[ -n "${CAP_SERVER_URL:-}" ]]; then
    echo "build-and-sync.sh: WARNING: CAP_SERVER_URL is set ($CAP_SERVER_URL) but MINESKIN_LIVE_RELOAD=1 is not — ignoring it and bundling the static export." >&2
  fi
  export CAP_SERVER_URL=""
fi

# The Capacitor build needs a fully static export (`out/`), gated behind
# CAPACITOR_BUILD in next.config.ts.
CAPACITOR_BUILD=true npm run build

# Per-build we run `cap copy` (web assets + capacitor.config.json) only — NOT
# `cap sync`. `cap sync` also runs `cap update`, which regenerates the native
# capacitor plugin Gradle project and DELETES its build/ intermediates. Because
# this script runs from inside the native build (Gradle preBuild / Xcode phase),
# that wipe lands *after* Gradle has already run the capacitor module's tasks,
# so the app's checkAarMetadata / manifest-merge then fail reading the now-missing
# files. `cap copy` doesn't touch that module, so the build stays consistent.
#
# Run a full sync explicitly after adding/removing/upgrading a native plugin:
#   MINESKIN_CAP_SYNC=1 <build>   (or just `npx cap sync <platform>` once)
if [[ "${MINESKIN_CAP_SYNC:-}" == "1" ]]; then
  npx cap sync "$PLATFORM"
else
  npx cap copy "$PLATFORM"
fi

# Because `cap copy` never rewrites android/app/src/main/assets/capacitor.plugins.json
# (only `cap update` does) and that file is gitignored, it can name a plugin whose
# class no longer ships in the APK. Android's PluginManager.loadPluginClasses()
# aborts the whole list on the first ClassNotFoundException, so one stale entry
# leaves the bridge with *zero* plugins and every call rejects with
# `"<Plugin>" plugin is not implemented on android`.
if [[ "$PLATFORM" == "android" ]]; then
  registered="$(node -e '
    const {readFileSync} = require("fs");
    const json = JSON.parse(readFileSync("android/app/src/main/assets/capacitor.plugins.json", "utf8"));
    process.stdout.write(json.map((p) => p.pkg).sort().join("\n"));
  ')"
  # Matches only plugin modules: their projectDir ends in `/android'`, whereas
  # capacitor core's is `@capacitor/android/capacitor'`.
  compiled="$(sed -n "s|.*node_modules/\(.*\)/android'.*|\1|p" android/capacitor.settings.gradle | sort)"
  if [[ "$registered" != "$compiled" ]]; then
    echo "build-and-sync.sh: capacitor.plugins.json is out of sync with capacitor.settings.gradle." >&2
    echo "  registered in assets: ${registered//$'\n'/, }" >&2
    echo "  compiled into apk:    ${compiled//$'\n'/, }" >&2
    echo "  Fix with: npx cap update android" >&2
    exit 1
  fi
fi
