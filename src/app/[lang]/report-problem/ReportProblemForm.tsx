"use client";

import Button from "@/components/Button";
import { useDictionary } from "@/i18n";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { getFeedback } from "@sentry/browser";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Props {
  lang: string;
}

// Minimal shape of the Sentry feedback form instance we interact with.
type FeedbackForm = { appendToDom: () => void; open: () => void };

export function ReportProblemForm({ lang }: Props) {
  const { dictionary: dict } = useDictionary();
  const [feedback, setFeedback] = useState<ReturnType<typeof getFeedback>>();
  // Keep a single form instance so repeated clicks reopen it instead of
  // appending a new widget to the DOM each time.
  const formRef = useRef<FeedbackForm | null>(null);

  useEffect(() => {
    setFeedback(getFeedback());
  }, []);

  const openFeedback = async () => {
    if (!feedback) return;

    if (!formRef.current) {
      const form = await feedback.createForm({
        formTitle: dict.feedback.formTitle,
        showName: false,
        showEmail: true,
        isEmailRequired: false,
        emailLabel: dict.feedback.emailLabel,
        emailPlaceholder: dict.feedback.emailPlaceholder,
        messageLabel: dict.feedback.messageLabel,
        messagePlaceholder: dict.feedback.messagePlaceholder,
        submitButtonLabel: dict.feedback.submitButtonLabel,
        cancelButtonLabel: dict.feedback.cancelButtonLabel,
        successMessageText: dict.feedback.successMessageText,
        isRequiredLabel: dict.feedback.isRequiredLabel,
        addScreenshotButtonLabel: dict.feedback.addScreenshotButtonLabel,
        removeScreenshotButtonLabel: dict.feedback.removeScreenshotButtonLabel,
      });
      form.appendToDom();

      // Respect safe-area insets so the dialog isn't clipped behind a notch
      // when running inside the native (Capacitor) webview.
      const feedbackEl = document.getElementById("sentry-feedback");
      if (feedbackEl?.shadowRoot) {
        const style = document.createElement("style");
        style.textContent =
          ".dialog__position { inset: max(var(--page-margin), env(safe-area-inset-top, 0px)) max(var(--page-margin), env(safe-area-inset-right, 0px)) max(var(--page-margin), env(safe-area-inset-bottom, 0px)) max(var(--page-margin), env(safe-area-inset-left, 0px)) !important; }";
        feedbackEl.shadowRoot.prepend(style);
      }

      formRef.current = form;
    }

    formRef.current.open();
  };

  return (
    <div>
      <Link
        href={`/${lang}/`}
        className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-8"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {dict.reportProblem.back}
      </Link>

      <h1 className="text-3xl font-semibold tracking-tight mb-3">
        {dict.reportProblem.pageHeading}
      </h1>
      <p className="text-neutral-600 dark:text-neutral-300 mb-8 leading-relaxed">
        {dict.reportProblem.pageDescription}
      </p>

      <div className="rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
        <Button
          type="button"
          variant="primary"
          fullWidth
          leftIcon={<ChatBubbleIcon />}
          onClick={openFeedback}
        >
          {dict.reportProblem.openButton}
        </Button>
        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {dict.reportProblem.note}
        </p>
      </div>
    </div>
  );
}
