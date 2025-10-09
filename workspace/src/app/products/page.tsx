
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
import { ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PRODUCTS_PER_PAGE = 8;

function ProductGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastVisibleId, setLastVisibleId] = useState<string | undefined>(undefined);
  const [firstVisibleId, setFirstVisibleId] = useState<string | undefined>(undefined);

  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search') || '';
  const startAfter = searchParams.get('startAfter') || undefined;
  const endBefore = searchParams.get('endBefore') || undefined;

  const allCategories: Category[] = [{ id: 'all', name: 'All' }, ...getCategories()];
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { products: fetchedProducts, lastVisibleId: newLastId, firstVisibleId: newFirstId, hasMore: newHasMore } = await getProducts({ 
        category, 
        sort, 
        search,
        limit: PRODUCTS_PER_PAGE,
        startAfter,
        endBefore
      });
      setProducts(fetchedProducts);
      setLastVisibleId(newLastId);
      setFirstVisibleId(newFirstId);
      setHasMore(newHasMore);
      setLoading(false);
    };
    fetchProducts();
  }, [category, sort, search, startAfter, endBefore]);


  const handleFilterChange = (key: 'category' | 'sort', value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    // Reset pagination when filters change
    current.delete('startAfter');
    current.delete('endBefore');

    if (!value || value === 'all') {
      current.delete(key);
    } else {
      current.set(key, value);
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  };

  const handlePageChange = (direction: 'next' | 'prev') => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (direction === 'next' && lastVisibleId) {
        current.delete('endBefore');
        current.set('startAfter', lastVisibleId);
    } else if (direction === 'prev' && firstVisibleId) {
        current.delete('startAfter');
        current.set('endBefore', firstVisibleId);
    }
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  };
  
  const isPrevDisabled = !endBefore;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold font-headline">
          {search ? `Searching for "${search}"` : (allCategories.find(c => c.id === category)?.name || 'All Products')}
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="category-select">Category:</Label>
            <Select value={category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger id="category-select" className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="sort-select">Sort by:</Label>
            <Select value={sort} onValueChange={(value) => handleFilterChange('sort', value)}>
              <SelectTrigger id="sort-select" className="w-[180px]">
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
            {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="aspect-[4/5]" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-1/4" />
                </div>
            ))}
        </div>
      ) : products.length > 0 ? (
        <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="flex justify-center items-center gap-4 mt-12">
            <Button variant="outline" onClick={() => handlePageChange('prev')} disabled={isPrevDisabled}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button variant="outline" onClick={() => handlePageChange('next')} disabled={!hasMore}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
        </>
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
