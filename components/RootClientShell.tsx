// components/RootClientShell.tsx
'use client';

import { useState } from "react";
import LogoPreloader from "@/components/ui/LogoPreloader";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from 'react-hot-toast';

export default function RootClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  return (
    <ThemeProvider>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: { zIndex: 99999 },
        }}
        containerStyle={{ zIndex: 99999 }}
      />
      <LogoPreloader onFinish={() => setLoading(false)} />
      {!loading && children}
    </ThemeProvider>
  );
}