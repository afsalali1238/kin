import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "kinē — 3D Interactive Physiotherapy & Rehabilitation Guide",
  description: "Clinical-grade interactive 3D physiotherapy, musculoskeletal assessment, and personalised rehabilitation exercises.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
