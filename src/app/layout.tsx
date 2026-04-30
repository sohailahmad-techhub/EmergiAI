import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoCantArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "AI Emergency Decision Assistant",
  description: "Rapid medical emergency assessment and first aid guidance.",
};

import ThemeHandler from "@/components/ThemeHandler";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${notoCantArabic.variable} h-full antialiased`} suppressHydrationWarning>
      <head />
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white" suppressHydrationWarning>
        <ThemeHandler />
        {children}
      </body>
    </html>
  );
}
