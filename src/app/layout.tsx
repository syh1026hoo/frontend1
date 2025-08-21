import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";

export const metadata: Metadata = {
  title: "ETF 정보 플랫폼",
  description: "실시간 ETF 정보와 분석을 제공하는 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen antialiased">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
