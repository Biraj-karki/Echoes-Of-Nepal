import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Manrope } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { AuthProvider } from "./AuthProvider";
import { SocketProvider } from "./SocketProvider";
import ConditionalRootWrapper from "./ConditionalRootWrapper";
import { LanguageProvider } from "./LanguageProvider";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Echoes Of Nepal",
  description: "Echoes Of Nepal - routes, rides & stories. Discover authentic travel experiences, connect with local vendors, and share your adventure.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Echoes of Nepal",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/logo.png",
    apple: "/icons/icon-192x192.png",
  },
  metadataBase: new URL("https://echoesofnepal.com"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: true,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.variable}>
      <head>
        <meta name="application-name" content="Echoes of Nepal" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Echoes" />
        <meta name="theme-color" content="#0f172a" />
        <Script src="https://khalti.com/static/khalti-checkout.js" strategy="lazyOnload" />
      </head>
      <body className={manrope.className}>
        <AuthProvider>
          <LanguageProvider>
            <SocketProvider>
              <Toaster position="top-right" toastOptions={{
                style: {
                  background: '#1e293b',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)'
                }
              }} />
              <ConditionalRootWrapper>{children}</ConditionalRootWrapper>
            </SocketProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
