
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { getCartItemRecommendations } from '@/ai/flows/cart-item-recommendations';
import type { AiCartItem, CartItemRecommendationsOutput } from '@/lib/types';
import { getProductById } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import LoadingLogo from '@/components/shop/loading-logo';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';

export default function AiRecommendations() {
  const { cart } = useCart();
  const [recommendations, setRecommendations] = useState<CartItemRecommendationsOutput['recommendations']>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Map<string, Product | null>>(new Map());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (cart.length > 0) {
      setLoading(true);
      const fetchRecommendations = async () => {
        // Create a map of items in the cart for quick lookup
        const cartItemIds = new Set(cart.map(item => item.id));
        
        const cartItemsForAI: AiCartItem[] = [];
        // Use Promise.all to fetch details for all cart items concurrently
        const cartProductDetailsPromises = cart.map(item => getProductById(item.id));
        const cartProductDetails = await Promise.all(cartProductDetailsPromises);

        cartProductDetails.forEach((productDetails, index) => {
            if (productDetails) {
                cartItemsForAI.push({
                    productId: productDetails.id,
                    name: productDetails.title,
                    category: productDetails.category || 'unknown',
                    description: productDetails.description || 'No description',
                });
            }
        });

        if (cartItemsForAI.length === 0) {
          setLoading(false);
          return;
        }

        try {
          const result = await getCartItemRecommendations({ cartItems: cartItemsForAI });
          
          // Filter out recommendations that are already in the cart
          const filteredRecommendations = result.recommendations.filter(rec => !cartItemIds.has(rec.productId));
          setRecommendations(filteredRecommendations);

          if (filteredRecommendations.length > 0) {
              const productPromises = filteredRecommendations.map(rec => getProductById(rec.productId));
              const fetchedProducts = await Promise.all(productPromises);
              
              const productMap = new Map();
              fetchedProducts.forEach((product, index) => {
                const rec = filteredRecommendations[index];
                if (rec) {
                    productMap.set(rec.productId, product); // product can be null
                }
              });
              setRecommendedProducts(productMap);
          }

        } catch (error) {
          console.error("Failed to get AI recommendations:", error);
          toast({
            variant: "destructive",
            title: "Recommendation Error",
            description: "Could not fetch AI recommendations."
          });
        } finally {
          setLoading(false);
        }
      };

      const timer = setTimeout(() => {
        fetchRecommendations();
      }, 500); // Debounce to avoid rapid calls

      return () => clearTimeout(timer);

    } else {
      setRecommendations([]);
      setRecommendedProducts(new Map());
    }
  }, [cart, toast]);

  if (loading) {
    return (
      <div className="py-4">
        <h3 className="text-lg font-semibold mb-2">You Might Also Like</h3>
        <div className="flex items-center justify-center h-24">
            <LoadingLogo />
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-4">
        <h3 className="text-lg font-semibold mb-2">You Might Also Like</h3>
        <div className="space-y-3">
            {recommendations.map(rec => {
                const productDetails = recommendedProducts.get(rec.productId);

                // If productDetails is not found or is null, we can't render it.
                if (!productDetails) return null;

                const imageSrc = productDetails.images && productDetails.images.length > 0 ? productDetails.images[0] : `https://picsum.photos/seed/${rec.productId}/400/500`;

                return (
                <Link key={rec.productId} href={`/products/${rec.productId}`} className="flex items-center gap-4 p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Image src={imageSrc} alt={rec.name} width={60} height={75} quality={100} className="rounded-md object-cover aspect-[4/5]" />
                    <div className="flex-grow">
                        <p className="font-semibold">{rec.name}</p>
                        <p className="text-xs text-muted-foreground">{rec.description}</p>
                    </div>
                </Link>
                )
            })}
        </div>
    </div>
  );
}
