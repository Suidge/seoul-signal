import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suidge.github.io/koncert-together";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Koncert Together",
    template: "%s"
  },
  description: "面向中文用户的 K-pop 全球巡演、艺人主页、场馆指南与 fandom 内容站。",
  applicationName: "Koncert Together",
  keywords: ["K-pop", "演唱会", "巡演", "购票", "Koncert Together", "韩流"],
  openGraph: {
    title: "Koncert Together",
    description: "面向中文用户的 K-pop 全球巡演、艺人主页、场馆指南与 fandom 内容站。",
    siteName: "Koncert Together",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Koncert Together",
    description: "面向中文用户的 K-pop 全球巡演、艺人主页、场馆指南与 fandom 内容站。"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
