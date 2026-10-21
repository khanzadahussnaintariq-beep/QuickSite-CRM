'use client';

import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import LogoPreloader from "@/components/ui/LogoPreloader";
import { useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{ style: { zIndex: 99999 } }}
            containerStyle={{ zIndex: 99999 }}
          />
          <LogoPreloader onFinish={() => setLoading(false)} />
          {!loading && children}
        </ThemeProvider>
      </body>
    </html>
  );
}