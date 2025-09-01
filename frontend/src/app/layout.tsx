import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CommunityOS - Discord Community Monetization Platform',
  description: 'Transform your Discord community into a revenue-generating business with automated billing, member management, and premium features.',
  keywords: ['Discord', 'community', 'monetization', 'SaaS', 'subscription', 'billing'],
  authors: [{ name: 'CommunityOS Team' }],
  openGraph: {
    title: 'CommunityOS - Discord Community Monetization Platform',
    description: 'Transform your Discord community into a revenue-generating business',
    url: 'https://communityos.com',
    siteName: 'CommunityOS',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CommunityOS Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CommunityOS - Discord Community Monetization Platform',
    description: 'Transform your Discord community into a revenue-generating business',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) return false;
        return failureCount < 2;
      },
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        'min-h-screen bg-background font-sans antialiased',
        inter.className
      )}>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="relative flex min-h-screen flex-col">
                <div className="flex-1">{children}</div>
              </div>
              <Toaster richColors position="bottom-right" />
            </ThemeProvider>
          </SessionProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}