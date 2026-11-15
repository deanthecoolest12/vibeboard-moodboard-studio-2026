import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VibeBoard — creative direction, on demand",
  description: "Turn a mood into a color palette, image prompts, and playlist inspiration."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
