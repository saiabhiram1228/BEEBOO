
'use client';

import { useAuth } from '@/context/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Allow admin to access these non-admin paths to enable shopping
const ALLOWED_NON_ADMIN_PATHS_FOR_ADMIN = [
    '/',
    '/products',
    '/checkout',
    '/order-confirmation',
    '/order-history',
    '/login',
    '/signup',
];

export default function AdminRedirect({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAdmin) {
      // If admin is on the login/signup page, redirect to dashboard
      if (pathname === '/login' || pathname === '/signup') {
        router.replace('/admin/dashboard');
        return;
      }
      
      // Check if the current path is an admin route
      const isAdminRoute = pathname.startsWith('/admin');
      
      // Check if the current path is an allowed non-admin route for shopping
      const isAllowedShopRoute = ALLOWED_NON_ADMIN_PATHS_FOR_ADMIN.some(p => pathname === p || (p !== '/' && pathname.startsWith(p)));

      // If it's not an admin route AND not an allowed shopping route, redirect to dashboard.
      if (!isAdminRoute && !isAllowedShopRoute) {
        console.log(`Admin on restricted path ${pathname}, redirecting.`);
        router.replace('/admin/dashboard');
      }
    }
  }, [isAdmin, loading, pathname, router]);

  // To avoid flicker, if the user is an admin on a path that will be redirected,
  // we can show a loading state.
  if (!loading && isAdmin) {
      if (pathname === '/login' || pathname === '/signup') {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Redirecting to dashboard...</p>
            </div>
        );
      }
      const isAdminRoute = pathname.startsWith('/admin');
      const isAllowedShopRoute = ALLOWED_NON_ADMIN_PATHS_FOR_ADMIN.some(p => pathname === p || (p !== '/' && pathname.startsWith(p)));
      if (!isAdminRoute && !isAllowedShopRoute) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Redirecting...</p>
            </div>
        );
      }
  }


  return <>{children}</>;
}
