import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Bodoni_Moda, Hanken_Grotesk } from "next/font/google";
import { conference } from "@/content";
import "./tokens.css";
import "./base.css";

// next/font downloads both faces at build time and serves them from this site's own domain.
const display = Bodoni_Moda({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-display-face", display: "swap" });
const text = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-text-face", display: "swap" });

export const metadata: Metadata = {
  title: conference.name,
  description: `${conference.theme}. ${conference.date}, ${conference.venue}.`,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable}`}>
      <body>{children}</body>
    </html>
  );
}
