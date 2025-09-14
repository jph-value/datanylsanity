import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Datanyl — Tiny data tools (with Meme Mode)",
    template: "%s · Datanyl",
  },
  description:
    "Tiny, fast, in-browser data tools. Meme Mode for fun, Boring Mode for work.",
  metadataBase: new URL("https://datanyl.com"),
  openGraph: {
    title: "Datanyl — Tiny data tools (with Meme Mode)",
    description: "Tiny, fast, in-browser data tools. Meme Mode for fun, Boring Mode for work.",
    url: "https://datanyl.com",
    siteName: "Datanyl",
    locale: "en_US",
    type: "website",
    images: [{ url: "/opengraph-image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Datanyl — Tiny data tools (with Meme Mode)",
    description: "Tiny, fast, in-browser data tools. Meme Mode for fun, Boring Mode for work.",
    images: ["/opengraph-image"],
  },
  icons: {
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
