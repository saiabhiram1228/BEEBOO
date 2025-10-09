
import Link from 'next/link';
import ProductCard from '@/components/shop/product-card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

interface ProductSectionProps {
  title: string;
  products: Product[];
  showMoreHref: string;
}

export default function ProductSection({ title, products, showMoreHref }: ProductSectionProps) {
  if (products.length === 0) {
    return null;
  }
  
  return (
    <section className="py-12 md:py-16 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-headline font-bold">
                {title}
            </h2>
             <Button asChild variant="ghost" className="hidden md:flex">
                <Link href={showMoreHref}>
                    Show More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
         <div className="text-center mt-8 md:hidden">
            <Button asChild variant="outline" size="lg">
                <Link href={showMoreHref}>Show More</Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
