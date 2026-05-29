import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "图片工具箱 - 免费在线图片压缩转换裁剪加水印",
    template: "%s | 图片工具箱",
  },
  description:
    "免费在线图片处理工具。支持图片压缩、格式转换、裁剪、添加水印。手机电脑都能用，无需下载安装，处理完即删，保护隐私。",
  keywords: [
    "图片压缩",
    "图片转换",
    "图片裁剪",
    "在线工具",
    "免费",
    "图片加水印",
    "JPG转PNG",
    "图片处理",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "图片工具箱",
  },
  openGraph: {
    title: "图片工具箱 - 免费在线图片处理",
    description: "图片压缩、格式转换、裁剪、加水印，免费好用",
    type: "website",
    locale: "zh_CN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f5f5f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
