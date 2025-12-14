import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ToastContainer from "@/components/ToastContainer";
import LowStockAlerts from "@/components/LowStockAlerts";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Coffee PuLa - ระบบ POS ร้านกาแฟ",
  description: "ระบบ Point of Sale สำหรับร้านกาแฟ พร้อมระบบจัดการคลังสินค้า รายงาน และสมาชิก",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Coffee PuLa",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#8B4513",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8B4513" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className={`${prompt.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <DarkModeProvider>
            <ToastProvider>
              {children}
              <ToastContainer />
              <LowStockAlerts />
            </ToastProvider>
          </DarkModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
