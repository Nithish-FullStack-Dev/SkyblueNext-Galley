// app/layout.tsx

import type { Metadata } from "next";

import { Inter } from "next/font/google";

import "./globals.css";

import { AuthProvider } from "@/components/auth-provider";

import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkyBlue Galley",

  description: "Advanced In-flight Catering Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}

          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
