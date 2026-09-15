import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "kinē — 3D Interactive Physiotherapy & Rehabilitation Guide",
  description: "Clinical-grade interactive 3D physiotherapy, musculoskeletal assessment, and personalised rehabilitation exercises.",
  applicationName: "kinē",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "kinē" },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#121714" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
