"use client";

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import * as Sentry from "@sentry/browser";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const openFeedback = async () => {
    const feedback = Sentry.getFeedback();
    const form = await feedback?.createForm();
    form?.appendToDom();
    form?.open();
  };

  return (
    <html>
      <body className="bg-neutral-900 text-white">
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ maxWidth: "28rem", textAlign: "center", margin: "0 1rem" }}>
            <ExclamationTriangleIcon
              width={64}
              height={64}
              style={{
                color: "#475569",
                marginBottom: "1.5rem",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            />
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "0.75rem",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                color: "#94a3b8",
                marginBottom: "2rem",
              }}
            >
              An unexpected error occurred. Please try again or report the issue
              if it persists.
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center",
              }}
            >
              <button
                onClick={reset}
                style={{
                  padding: "0.5rem 1.5rem",
                  backgroundColor: "#2563eb",
                  color: "white",
                  borderRadius: "0.375rem",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Try Again
              </button>
              <button
                onClick={openFeedback}
                style={{
                  padding: "0.5rem 1.5rem",
                  backgroundColor: "transparent",
                  color: "#e2e8f0",
                  borderRadius: "0.375rem",
                  border: "1px solid #64748b",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Report Issue
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
