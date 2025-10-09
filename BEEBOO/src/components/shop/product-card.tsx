
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();


  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!product.stock) return;

    if (product.sizes && product.sizes.length > 0) {
      router.push(`/products/${product.id}`);
      return;
    }

    addToCart({
      id: product.id,
      name: product.title,
      price: product.final_price,
      image: product.images[0],
      size: 'One Size',
    });
  };

  return (
    <Card className="group overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col border-none bg-transparent">
      <Link href={`/products/${product.id}`} className="flex flex-col flex-grow">
        <CardContent className="p-0 flex flex-col flex-grow">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              quality={100}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
             <div className="absolute top-2 left-2 flex flex-col gap-1">
                {!product.stock && (
                  <Badge variant="secondary">Out of Stock</Badge>
                )}
                 {product.discount_percentage && product.discount_percentage > 0 && (
                    <Badge variant="destructive">{product.discount_percentage}% OFF</Badge>
                )}
             </div>
          </div>
          <div className="p-2 md:p-3 bg-transparent flex flex-col flex-grow">
            <h3 className="font-semibold text-sm md:text-base truncate flex-grow">{product.title}</h3>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-baseline gap-2">
                <p className="text-sm md:text-base font-bold text-primary">
                  ₹{product.final_price.toFixed(2)}
                </p>
                {product.mrp_price && product.mrp_price > product.final_price && (
                    <p className="text-xs md:text-sm text-muted-foreground line-through">
                        ₹{product.mrp_price.toFixed(2)}
                    </p>
                )}
              </div>
              <Button size="icon" variant="ghost" className="rounded-full w-7 h-7 md:w-8 md:h-8 p-0" onClick={handleAddToCart} disabled={!product.stock}>
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add to Cart</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
