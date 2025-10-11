
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import AiRecommendations from './ai-recommendations';
import { useState } from 'react';

export default function CartSheet({ children }: { children: React.ReactNode }) {
  const { cart, updateQuantity, removeFromCart, total } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)})</SheetTitle>
          <SheetDescription>
            Review the items in your shopping cart.
          </SheetDescription>
        </SheetHeader>
        <Separator />
        {cart.length > 0 ? (
          <>
            <ScrollArea className="flex-grow pr-4 -mr-6">
              <div className="flex flex-col gap-4 py-4">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex items-start gap-4">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={100}
                      quality={100}
                      className="rounded-md object-cover aspect-[4/5]"
                    />
                    <div className="flex-grow">
                      <Link href={`/products/${item.id}`} className="font-semibold hover:underline" onClick={() => setIsOpen(false)}>
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                      <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => removeFromCart(item.id, item.size)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Separator />
              <AiRecommendations />
            </ScrollArea>
            <SheetFooter className="mt-auto">
                <div className="w-full space-y-4">
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Subtotal</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>
                    <Button asChild size="lg" className="w-full" variant="outline">
                        <Link href="/checkout" onClick={() => setIsOpen(false)}>Proceed to Checkout</Link>
                    </Button>
                </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-20 w-20 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Add some products to get started.</p>
            <Button asChild className="mt-4" onClick={() => setIsOpen(false)} variant="outline">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
