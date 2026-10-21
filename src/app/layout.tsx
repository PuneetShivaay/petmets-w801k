
import type { Metadata, Viewport } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { LoadingProvider } from '@/contexts/loading-context';
import { AuthProvider } from '@/contexts/auth-context';
import { GlobalLoader } from '@/components/global-loader';
import { NavigationProgressProvider } from '@/components/layout/navigation-progress';
import { SITE } from '@/config/site';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-pt-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} – ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    'pet services', 'pet care', 'dog walker', 'pet grooming', 'pet training',
    'pet boarding', 'pet adoption', 'pet photography', 'pet match', 'pet records', 'India',
  ],
  alternates: { canonical: '/' },
  icons: { icon: '/images/logo.png', apple: '/images/logo.png' },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: `${SITE.name} – ${SITE.tagline}`,
    description: SITE.description,
    url: '/',
    locale: 'en_IN',
    images: [{ url: '/images/banner.jpeg', alt: SITE.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} – ${SITE.tagline}`,
    description: SITE.description,
    images: ['/images/banner.jpeg'],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#FF642F',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={ptSans.variable} suppressHydrationWarning>
      {/* Browser extensions (e.g. LocatorJS, Grammarly) inject attributes here; ignore those diffs. */}
      <head suppressHydrationWarning />
      <body className={`${ptSans.className} font-body antialiased`} suppressHydrationWarning>
        <NavigationProgressProvider>
          <LoadingProvider>
            <AuthProvider>
              <AppLayout>{children}</AppLayout>
              <Toaster />
              {/* GlobalLoader is only for blocking actions (logout, saving) — not navigation. */}
              <GlobalLoader />
            </AuthProvider>
          </LoadingProvider>
        </NavigationProgressProvider>
      </body>
    </html>
  );
}
