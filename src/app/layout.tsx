
import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { LoadingProvider } from '@/contexts/loading-context';
import { AuthProvider } from '@/contexts/auth-context';
import { GlobalLoader } from '@/components/global-loader';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-pt-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PetMets - Your Pet Companion App',
  description: 'Connecting pets and owners with services and care.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${ptSans.className} font-body antialiased`}>
        <LoadingProvider>
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
            <Toaster />
            {/* The main GlobalLoader is for page transitions, not initial auth loading. */}
            <GlobalLoader />
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
