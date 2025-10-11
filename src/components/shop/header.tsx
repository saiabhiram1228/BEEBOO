
'use client';

import Link from 'next/link';
import { ShoppingBag, Search, Menu, X, User } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import CartSheet from './cart-sheet';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Logo from './logo';
import { useToast } from '@/hooks/use-toast';


export default function Header() {
  const { cart } = useCart();
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get('search') as string;
    router.push(`/products?search=${searchQuery}`);
    setMobileMenuOpen(false); // Close mobile menu on search
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  }

  const handleContactClick = () => {
    const email = 'beeboocare123@gmail.com';
    navigator.clipboard.writeText(email);
    toast({
      title: 'Contact Email Copied',
      description: `You can reach us at: ${email}`,
    });
  };

  const NavLinks = ({ inSheet = false }: { inSheet?: boolean }) => (
    <>
      <Link href="/products" className={`link-underline transition-colors ${inSheet ? 'block py-2' : ''}`} onClick={() => setMobileMenuOpen(false)}>All Products</Link>
      <Link href="/products?category=unisex-apparel" className={`link-underline transition-colors ${inSheet ? 'block py-2' : ''}`} onClick={() => setMobileMenuOpen(false)}>Unisex</Link>
      <Link href="/products?category=men-tops" className={`link-underline transition-colors ${inSheet ? 'block py-2' : ''}`} onClick={() => setMobileMenuOpen(false)}>Men</Link>
      <Link href="/products?category=women-tops" className={`link-underline transition-colors ${inSheet ? 'block py-2' : ''}`} onClick={() => setMobileMenuOpen(false)}>Women</Link>
    </>
  );

  if (isAdmin) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
           <Link href="/admin/dashboard" className="text-xl font-bold font-headline text-primary flex items-center gap-2">
            <Logo className="h-12" /> - Admin
          </Link>
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push('/admin/dashboard')}>Dashboard</Button>
            <Button onClick={handleLogout} variant="outline">Logout</Button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/">
            <Logo />
            <span className="sr-only">BEE BOO</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2 rounded-md border px-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              name="search"
              type="search"
              placeholder="Search products..."
              className="bg-transparent py-1.5 text-sm focus:outline-none placeholder:text-muted-foreground"
              defaultValue={searchParams.get('search') || ''}
            />
          </form>

          <CartSheet>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Open cart</span>
            </Button>
          </CartSheet>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push('/order-history')}>Order History</DropdownMenuItem>
                <DropdownMenuItem onSelect={handleContactClick}>Contact Us</DropdownMenuItem>
                {isAdmin && <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>Dashboard</DropdownMenuItem>}
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Button asChild variant="ghost" className="link-underline">
                <Link href="/login">
                    Login
                </Link>
            </Button>
          )}

          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                  <div className="flex items-center mb-6">
                      <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                          <Logo />
                          <span className="sr-only">BEE BOO</span>
                      </Link>
                  </div>
                </SheetHeader>
                
                <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-md border px-2 mb-6">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                        name="search"
                        type="search"
                        placeholder="Search products..."
                        className="bg-transparent py-1.5 text-sm focus:outline-none placeholder:text-muted-foreground w-full"
                        defaultValue={searchParams.get('search') || ''}
                    />
                </form>

                <nav className="flex flex-col gap-4 text-lg font-medium">
                    <NavLinks inSheet />
                </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
