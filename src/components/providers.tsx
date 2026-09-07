'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { IndustryProvider } from '@/context/industry-context';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <IndustryProvider>
          {children}
          <Toaster richColors position="top-right" />
        </IndustryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
