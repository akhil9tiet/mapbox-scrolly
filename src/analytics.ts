type AnalyticsParameters = Record<string, string | number>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const initializeAnalytics = (measurementId: string | undefined) => {
  if (!measurementId || window.gtag) return;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = (...args) => window.dataLayer?.push(args);
  window.gtag('js', new Date());
  window.gtag('config', measurementId);

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
};

export const trackAnalyticsEvent = (name: string, parameters: AnalyticsParameters) => {
  window.gtag?.('event', name, parameters);
};
