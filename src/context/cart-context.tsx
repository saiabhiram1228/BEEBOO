
'use client';

import type { CartItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import React, { createContext, useContext, useState, ReactNode } from 'react';

const SHIPPING_FEE = 70;

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  removeFromCart: (id: string, size: string) => void;
  clearCart: () => void;
  subtotal: number;
  total: number;
  shippingFee: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id && i.size === item.size);
      if (existingItem) {
        return prevCart.map((i) =>
          i.id === item.id && i.size === item.size ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    toast({
      title: "Added to cart",
      description: `${item.name} (Size: ${item.size}) has been added to your cart.`,
    });
  };

  const updateQuantity = (id: string, size: string, quantity: number) => {
    setCart((prevCart) => {
        if (quantity <= 0) {
            return prevCart.filter((i) => !(i.id === id && i.size === size));
        }
        return prevCart.map((i) =>
            i.id === id && i.size === size ? { ...i, quantity } : i
        );
    });
  };

  const removeFromCart = (id: string, size: string) => {
    setCart((prevCart) => prevCart.filter((i) => !(i.id === id && i.size === size)));
  };
  
  const clearCart = () => {
    setCart([]);
  }

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const total = subtotal > 0 ? subtotal + SHIPPING_FEE : 0;
  const shippingFee = subtotal > 0 ? SHIPPING_FEE : 0;

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, subtotal, total, shippingFee }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
