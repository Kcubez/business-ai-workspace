import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { DashboardLayoutClient } from '@/components/layout/dashboard-layout-client';

export const metadata: Metadata = {
  title: 'Business AI Integration | Multi-Industry Edition',
  description: 'Enterprise operational dashboard clone with multi-industry data switching',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <Providers>
          <DashboardLayoutClient>{children}</DashboardLayoutClient>
        </Providers>
      </body>
    </html>
  );
}
