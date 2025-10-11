
'use client';

import { getProductById, getProducts } from '@/lib/data';
import { notFound, useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { Star, Truck, Paintbrush, Share2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useEffect, useState, useMemo } from 'react';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/shop/product-card';

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

export default function ProductDetailPage() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const fetchProductAndRelated = async () => {
      setLoading(true);
      const fetchedProduct = await getProductById(productId);
      if (!fetchedProduct) {
        notFound();
      }
      setProduct(fetchedProduct);
      if (fetchedProduct?.sizes && fetchedProduct.sizes.length > 0) {
        setSelectedSize(fetchedProduct.sizes[0]);
      }
      
      // Fetch related products from the same category
      if (fetchedProduct?.category) {
        // Fetch more products to have enough to show 4 after filtering and shuffling.
        const fetchedRelated = await getProducts({ category: fetchedProduct.category, limit: 10 });
        // Filter out the current product from the related list and shuffle
        if (fetchedRelated) {
          const shuffled = shuffle(fetchedRelated.filter(p => p.id !== fetchedProduct.id));
          setRelatedProducts(shuffled.slice(0, 4));
        }
      }

      setLoading(false);
    };

    fetchProductAndRelated();
  }, [productId]);

  // Generate a deterministic "random" review count based on the product ID.
  const reviewCount = useMemo(() => {
    if (!productId) return 0;
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
        const char = productId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // Ensure it's a positive number between 10 and 99
    return (Math.abs(hash) % 90) + 10;
  }, [productId]);
  
  const handleAddToCart = () => {
    if (!product) return false;
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        variant: "destructive",
        title: "Please select a size",
      });
      return false;
    }

    addToCart({ 
      id: product.id, 
      name: product.title, 
      price: product.final_price, 
      image: product.images[0],
      size: selectedSize || 'One Size'
    });
    return true;
  }

  const handleBuyNow = () => {
    const added = handleAddToCart();
    if(added) {
        router.push('/checkout');
    }
  }


  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        toast({
          title: "Link Copied!",
          description: "Product link has been copied to your clipboard.",
        });
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
        toast({
          variant: "destructive",
          title: "Copy Failed",
          description: "Could not copy the link. Please try again.",
        });
      });
  };

  const handleDescriptionClick = () => {
    if (!user) {
        router.push(`/login?redirect=/products/${productId}`);
        return;
    }
    setShowDescriptionDialog(true);
  }

  if (loading || !product) {
    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div>
                    <Skeleton className="relative aspect-[4/5] rounded-lg" />
                </div>
                <div className="flex flex-col justify-center space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-12 w-1/2" />
                </div>
            </div>
        </div>
    );
  }

  return (
    <>
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <Carousel className="w-full">
            <CarouselContent>
              {product.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-[4/5] rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src={image}
                      alt={`${product.title} - image ${index + 1}`}
                      fill
                      quality={100}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={index === 0}
                    />
                     {product.discount_percentage && product.discount_percentage > 0 && (
                        <Badge variant="destructive" className="absolute top-3 left-3 text-base">{product.discount_percentage}% OFF</Badge>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {product.images.length > 1 && (
                <>
                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
                </>
            )}
          </Carousel>
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-3xl lg:text-4xl font-bold font-headline">{product.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5 text-yellow-500">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 text-muted-foreground fill-muted" />
            </div>
            <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
          </div>
          <div className="flex items-baseline gap-3 mt-4">
              <p className="text-3xl font-bold text-primary">₹{product.final_price.toFixed(2)}</p>
               {product.mrp_price && product.mrp_price > product.final_price && (
                <p className="text-xl text-muted-foreground line-through">
                    ₹{product.mrp_price.toFixed(2)}
                </p>
              )}
          </div>
          <Separator className="my-6" />

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <Label className="text-lg font-medium">Size</Label>
              <RadioGroup 
                value={selectedSize || ""} 
                onValueChange={setSelectedSize} 
                className="flex items-center gap-2 mt-2"
              >
                {product.sizes.map(size => (
                  <Label 
                    key={size} 
                    htmlFor={`size-${size}`}
                    className={`flex items-center justify-center rounded-md border text-sm font-medium h-9 w-14 cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground
                      ${selectedSize === size ? 'bg-primary text-primary-foreground' : ''}`}
                  >
                     <RadioGroupItem value={size} id={`size-${size}`} className="sr-only" />
                    {size}
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          <button onClick={handleDescriptionClick} className="text-left">
            <p className="text-muted-foreground leading-relaxed line-clamp-3 hover:line-clamp-none transition-all whitespace-pre-line">
                {product.description}
            </p>
            <span className="text-sm font-medium text-primary hover:underline">Click to read full description</span>
          </button>
          
          <div className="flex items-stretch gap-4 mt-8">
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={() => handleAddToCart()}
              disabled={!product.stock}
            >
              {product.stock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button
              size="lg"
              className="flex-1"
              onClick={handleBuyNow}
              disabled={!product.stock}
            >
              {product.stock ? 'Buy Now' : 'Out of Stock'}
            </Button>
          </div>
          <div className="flex items-center justify-center mt-4">
            <Button size="icon" variant="ghost" className="rounded-full" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
              <span className="sr-only">Share</span>
            </Button>
          </div>
            <div className="flex flex-col gap-1 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    <span>Delivery within 1 week</span>
                </div>
                <div className="flex items-center gap-2">
                    <Paintbrush className="h-5 w-5" />
                    <span>Reach out to us for custom designs</span>
                </div>
            </div>
        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="mt-16">
            <Separator className="my-8"/>
            <h2 className="text-3xl font-headline font-bold text-center mb-10">Related Collections</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {relatedProducts.map(p => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </div>
      )}

    </div>
    <AlertDialog open={showDescriptionDialog} onOpenChange={setShowDescriptionDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>{product.title}</AlertDialogTitle>
            <AlertDialogDescription className="max-h-[60vh] overflow-y-auto whitespace-pre-line">
                {product.description}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowDescriptionDialog(false)}>Close</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
