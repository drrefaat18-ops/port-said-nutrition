import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { conference } from "@/content";

export const metadata: Metadata = {
  title: conference.name,
  description: `${conference.theme}. ${conference.date}, ${conference.venue}.`,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
