
import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google'; // Import next/font
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { LoadingProvider } from '@/contexts/loading-context';
import { AuthProvider } from '@/contexts/auth-context';
import { GlobalLoader } from '@/components/global-loader';

// Configure the font
const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-pt-sans', // Optional: if you want to use it as a CSS variable
  display: 'swap', // Ensures text remains visible during font loading
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
      <head>
        {/* Removed old Google Font <link> tags */}
      </head>
      {/* Apply the font class to the body or a specific element */}
      <body className={`${ptSans.className} font-body antialiased`}>
        <LoadingProvider>
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
            <Toaster />
            <GlobalLoader />
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
