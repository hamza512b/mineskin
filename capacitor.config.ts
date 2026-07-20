import type { CapacitorConfig } from "@capacitor/cli";
import { readFileSync } from "fs";
import { resolve } from "path";

// The Capacitor CLI doesn't load .env files, so pick up CAP_SERVER_URL from
// .env.local/.env here. Already-exported variables win over file values.
for (const file of [".env.local", ".env"]) {
  let text: string;
  try {
    text = readFileSync(resolve(process.cwd(), file), "utf8");
  } catch {
    continue;
  }
  for (const line of text.split(/\r?\n/)) {
    if (line.trim().startsWith("#")) continue;
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

const config: CapacitorConfig = {
  appId: "pro.mineskin.app",
  appName: "Mineskin",
  webDir: "out",
  server: {
    // For development, point the WebView at a LAN dev server by setting
    // CAP_SERVER_URL before syncing, e.g.
    //   CAP_SERVER_URL=https://192.168.xx.yy:3000 npx cap sync
    // It must be HTTPS (`npm run dev:host`): the WebView only exposes
    // secure-context APIs over a trusted TLS origin. Leave it unset to load
    // the bundled static `out/` export instead.
    //
    // Note: native builds (Xcode/Gradle via scripts/build-and-sync.sh) ignore
    // CAP_SERVER_URL unless MINESKIN_LIVE_RELOAD=1 is also set, so a stray
    // export in the IDE's environment can't silently poison builds.
    ...(process.env.CAP_SERVER_URL
      ? {
          url: process.env.CAP_SERVER_URL,
          allowNavigation: [new URL(process.env.CAP_SERVER_URL).hostname],
        }
      : {}),
    androidScheme: "https",
  },
  ios: {
    contentInset: "never",
    backgroundColor: "#0a0a0a",
    allowsLinkPreview: false,
  },
  android: {
    backgroundColor: "#0a0a0a",
  },
  plugins: {
    SafeArea: {
      statusBarStyle: "LIGHT",
    },
    SystemBars: {
      insetsHandling: "disable",
    },
  },
};

export default config;
