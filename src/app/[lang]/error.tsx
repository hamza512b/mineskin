"use client";

import Button from "@/components/Button";
import { useDictionary } from "@/i18n";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import * as Sentry from "@sentry/browser";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { dictionary: dict } = useDictionary();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const openFeedback = async () => {
    const feedback = Sentry.getFeedback();
    const form = await feedback?.createForm({
      formTitle: dict.feedback.formTitle,
      showName: false,
      showEmail: false,
      messageLabel: dict.feedback.messageLabel,
      messagePlaceholder: dict.feedback.messagePlaceholder,
      submitButtonLabel: dict.feedback.submitButtonLabel,
      cancelButtonLabel: dict.feedback.cancelButtonLabel,
      successMessageText: dict.feedback.successMessageText,
      isRequiredLabel: dict.feedback.isRequiredLabel,
      addScreenshotButtonLabel: dict.feedback.addScreenshotButtonLabel,
      removeScreenshotButtonLabel: dict.feedback.removeScreenshotButtonLabel,
    });
    form?.appendToDom();
    form?.open();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-900">
      <div className="mx-4 max-w-md text-center">
        <ExclamationTriangleIcon className="mx-auto mb-6 size-16 text-red-300 dark:text-red-600" />
        <h1 className="mb-3 text-2xl font-bold text-neutral-900 dark:text-white">
          {dict.error.title}
        </h1>
        <p className="mb-8 text-neutral-600 dark:text-neutral-400">
          {dict.error.description}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset}>{dict.error.tryAgain}</Button>
          <Button variant="outlined" onClick={openFeedback}>
            {dict.error.reportIssue}
          </Button>
        </div>
      </div>
    </div>
  );
}
