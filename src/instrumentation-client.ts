// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { feedbackIntegration, replayIntegration } from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  enabled: process.env.NODE_ENV === "production",
  integrations: [
    replayIntegration(),
    feedbackIntegration({
      autoInject: false,
      colorScheme: "system",
      showBranding: false,
      showName: false,
      showEmail: true,
      isEmailRequired: false,
      themeLight: {
        foreground: "#0f172a",
        background: "#ffffff",
        accentForeground: "#ffffff",
        accentBackground: "#2563eb",
        successColor: "#16a34a",
        errorColor: "#ef4444",
        outline: "1px auto #2563eb",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      },
      themeDark: {
        foreground: "#f1f5f9",
        background: "#1e293b",
        accentForeground: "#ffffff",
        accentBackground: "#2563eb",
        successColor: "#22c55e",
        errorColor: "#ef4444",
        outline: "1px auto #3b82f6",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.3)",
      },
    }),
  ],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
