
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts } from '@/lib/data';
import { getCategories } from '@/lib/categories';
import ProductCard from '@/components/shop/product-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useRouter, usePathname } from 'next/navigation';
import type { Category, Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag } from 'lucide-react';

function ProductGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search') || '';

  const allCategories: Category[] = [{ id: 'all', name: 'All' }, ...getCategories()];
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      // Fetch all products matching filters, with no limit.
      const fetchedProducts = await getProducts({ category, sort, search });
      setProducts(fetchedProducts);
      setLoading(false);
    };
    fetchProducts();
  }, [category, sort, search]);


  const handleFilterChange = (key: 'category' | 'sort', value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (!value || value === 'all') {
      current.delete(key);
    } else {
      current.set(key, value);
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold font-headline text-center md:text-left">
          {search ? `Searching for "${search}"` : (allCategories.find(c => c.id === category)?.name || 'All Products')}
        </h1>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full">
            <Label htmlFor="category-select" className="whitespace-nowrap">Category:</Label>
            <Select value={category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger id="category-select" className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 w-full">
            <Label htmlFor="sort-select" className="whitespace-nowrap">Sort by:</Label>
            <Select value={sort} onValueChange={(value) => handleFilterChange('sort', value)}>
              <SelectTrigger id="sort-select" className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="aspect-[4/5]" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-1/4" />
                </div>
            ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 flex flex-col items-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold">Oops! Nothing here yet.</h2>
            <p className="text-muted-foreground mt-2">
                It looks like we couldn't find any products matching your filters.
                <br/>
                Try adjusting your search or filters.
            </p>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
    return (
      <Suspense fallback={<div className="container mx-auto px-4 md:px-6 py-8"><Skeleton className="h-96 w-full" /></div>}>
        <ProductGrid />
      </Suspense>
    )
}
