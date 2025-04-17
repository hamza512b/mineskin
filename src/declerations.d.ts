declare global {
  interface Window {
    gtag: (
      event: string,
      action: string,
      options?: Record<string, string | number | boolean>,
    ) => void;
  }
}

export {};
