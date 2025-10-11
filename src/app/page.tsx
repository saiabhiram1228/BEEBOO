
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getFeaturedProducts, getProducts } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import ProductSection from '@/components/shop/product-section';
import type { Product } from '@/lib/types';

// Helper function to shuffle an array
function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export default async function HomePage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  // Fetch products for each section concurrently
  let [
    featuredProducts, 
    unisexProducts, 
    menProducts, 
    womenProducts
  ]: [Product[], Product[], Product[], Product[]] = await Promise.all([
    getFeaturedProducts(), // Fetch all featured products
    getProducts({ category: 'unisex-apparel', limit: 4 }),
    getProducts({ category: 'men-tops', limit: 4 }),
    getProducts({ category: 'women-tops', limit: 4 })
  ]);

  // Shuffle the featured products and take the first 4
  featuredProducts = shuffle(featuredProducts).slice(0, 4);

  const categoryLinks = [
    { name: 'All Products', href: '/products' },
    { name: 'Unisex', href: '/products?category=unisex-apparel' },
    { name: 'Men', href: '/products?category=men-tops' },
    { name: 'Women', href: '/products?category=women-tops' },
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

      <section className="bg-secondary/50 py-12 md:py-16 px-4 md:px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-headline font-bold text-center mb-10">
            Trending Categories
          </h2>
          <div className="flex items-center justify-center flex-wrap gap-4">
            {categoryLinks.map((category) => (
              <Button key={category.name} asChild variant="outline" size="lg">
                <Link href={category.href}>
                  {category.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </section>
      
      <ProductSection title="Featured Products" products={featuredProducts} showMoreHref="/products" />
      <ProductSection title="Unisex" products={unisexProducts} showMoreHref="/products?category=unisex-apparel" />
      <ProductSection title="Men" products={menProducts} showMoreHref="/products?category=men-tops" />
      <ProductSection title="Women" products={womenProducts} showMoreHref="/products?category=women-tops" />
      
    </div>
  );
}
