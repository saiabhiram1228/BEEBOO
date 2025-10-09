
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-context';
import { AuthProvider } from '@/context/auth-context';
import Header from '@/components/shop/header';
import Footer from '@/components/shop/footer';
import AdminRedirect from '@/components/admin-redirect';
import AnnouncementBar from '@/components/shop/announcement-bar';
import FestivalEffects from '@/components/shop/festival-effects';

export const metadata: Metadata = {
  title: 'BEE BOO',
  description: 'A modern e-commerce experience.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased min-h-screen flex flex-col')}>
        <AuthProvider>
          <CartProvider>
            <AdminRedirect>
              <AnnouncementBar />
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
              <Toaster />
              <FestivalEffects />
            </AdminRedirect>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
