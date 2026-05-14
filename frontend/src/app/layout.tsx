import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./AuthProvider";
import ConditionalRootWrapper from "./ConditionalRootWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Echoes Of Nepal",
  description: "Echoes Of Nepal – routes, rides & stories",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script src="https://khalti.com/static/khalti-checkout.js" defer />
      </head>
      <AuthProvider>
        <ConditionalRootWrapper>
          {children}
        </ConditionalRootWrapper>
      </AuthProvider>
    </html>
  );
}
