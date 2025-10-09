
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getFeaturedProducts } from '@/lib/data';
import { getCategories } from '@/lib/categories';
import ProductCard from '@/components/shop/product-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Product } from '@/lib/types';

export default async function HomePage() {
  let featuredProducts: Product[] = [];
  try {
    const allFeatured = await getFeaturedProducts();
    // Shuffle the featured products array
    for (let i = allFeatured.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allFeatured[i], allFeatured[j]] = [allFeatured[j], allFeatured[i]];
    }
    featuredProducts = allFeatured;
  } catch (error) {
    console.error("Failed to fetch featured products for home page:", error);
    // The page will render with an empty featured products section instead of crashing.
  }
  
  const categories = getCategories();
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  const categoryLinks = [
    { name: 'All Products', href: '/products', imageId: 'cat-all' },
    { name: 'Unisex', href: '/products?category=unisex-apparel', imageId: 'cat-unisex' },
    { name: 'Men', href: '/products?category=men-tops', imageId: 'cat-men' },
    { name: 'Women', href: '/products?category=women-tops', imageId: 'cat-women' },
  ];

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[60vh] flex items-center justify-center">
        {heroImage && (
             <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                priority
                quality={100}
                data-ai-hint={heroImage.imageHint}
              />
        )}
        <div className="relative z-10 text-center text-primary-foreground p-8 bg-black/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20">
          <h1 className="text-4xl md:text-6xl font-headline font-extrabold text-white">
            Style for Every Story
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
            Discover curated collections that tell your tale.
          </p>
          <Button asChild size="lg" className="mt-8" variant="default">
            <Link href="/products">Shop Now</Link>
          </Button>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-headline font-bold text-center mb-10">
            Featured Products
          </h2>
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
             <div className="text-center text-muted-foreground">
                <p>Could not load featured products at this time. Please check back later.</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-secondary/50 py-12 md:py-20 px-4 md:px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-headline font-bold text-center mb-10">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {categoryLinks.map((category) => {
              const categoryImage = PlaceHolderImages.find(p => p.id === category.imageId);
              return (
              <Link href={category.href} key={category.name}>
                <Card className="overflow-hidden group hover:shadow-xl transition-shadow duration-300 border-none">
                  <CardContent className="p-0 relative">
                    {categoryImage && (
                        <Image
                        src={categoryImage.imageUrl}
                        alt={category.name}
                        width={400}
                        height={300}
                        quality={100}
                        className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={categoryImage.imageHint}
                        />
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-2">
                      <h3 className="text-xl font-bold text-white font-headline text-center">
                        {category.name}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )})}
          </div>
        </div>
      </section>
    </div>
  );
}
