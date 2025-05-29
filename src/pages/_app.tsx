import { TooltipProvider } from "@radix-ui/react-tooltip";
import "../styles/global.css";
import { ConfirmationDialogProvider } from "../widgets/Confirmation/Confirmation";
import { AppProps } from "next/app";
import Script from "next/script";
import CookiePopup from "@/widgets/CookiePopup";

function MineskinApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <GoogleAnalyticsScript />
      <TooltipProvider>
        <ConfirmationDialogProvider>
          <Component {...pageProps} />
        </ConfirmationDialogProvider>
      </TooltipProvider>
      <CookiePopup />
    </>
  );
}

const GoogleAnalyticsScript = () => {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_TAG_MANAGER}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('consent', 'default', {
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
          analytics_storage: "denied",
          wait_for_update: 1000,
        });
        gtag('js', new Date());
        gtag('config', '${process.env.NEXT_PUBLIC_TAG_MANAGER}');
        `}
      </Script>
    </>
  );
};

export default MineskinApp;
