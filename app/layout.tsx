import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deebo! Outreach Coach",
  description: "Rate and improve outreach messages before you send them.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
