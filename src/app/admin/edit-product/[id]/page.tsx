
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateProduct } from '@/lib/product-actions';
import { getProductById } from '@/lib/data';
import { getCategories } from '@/lib/categories';
import LoadingLogo from '@/components/shop/loading-logo';
import type { Category, Product, ProductFormData } from '@/lib/types';
import { notFound, useRouter, useParams } from 'next/navigation';


const apparelSizes = ["XS", "S", "M", "L", "XL", "XXL"];

const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  mrp_price: z.coerce.number().min(0, 'MRP must be a positive number').optional(),
  meesho_price: z.coerce.number().min(0, 'Price must be a positive number'),
  category: z.string().min(1, 'Please select a category'),
  images: z.string().min(1, 'At least one image URL is required'),
  stock: z.boolean().default(true),
  featured: z.boolean().default(false),
  sizes: z.array(z.string()).optional(),
}).refine(data => !data.mrp_price || data.mrp_price >= data.meesho_price, {
    message: "Offer price cannot be greater than MRP",
    path: ["meesho_price"],
});


export default function EditProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const categories = getCategories();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const productId = params.id as string;
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
        setLoading(true);
        const fetchedProduct = await getProductById(productId);
        if (!fetchedProduct) {
            notFound();
        }
        setProduct(fetchedProduct);
        
        // Reset form with fetched product data
        form.reset({
            title: fetchedProduct.title,
            description: fetchedProduct.description,
            mrp_price: fetchedProduct.mrp_price || 0,
            meesho_price: fetchedProduct.meesho_price,
            category: fetchedProduct.category,
            images: fetchedProduct.images.join('\n'),
            stock: fetchedProduct.stock,
            featured: fetchedProduct.featured,
            sizes: fetchedProduct.sizes,
        });

        const category = categories.find(c => c.id === fetchedProduct.category) || null;
        setSelectedCategory(category);
        setLoading(false);
    }
    fetchProduct();
  }, [productId, form, categories]);

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId) || null;
    setSelectedCategory(category);
    form.setValue('category', categoryId);
    if (!category?.isApparel) {
        form.setValue('sizes', []); // Reset sizes if category doesn't support them
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    if (!product) return;
    try {
      await updateProduct(product.id, data);
      
      toast({
        title: 'Product Updated',
        description: `${data.title} has been successfully updated.`,
      });
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update product. Please try again.',
      });
    }
  };
  
  const availableSizes = selectedCategory?.isApparel ? apparelSizes : [];

  if (loading) {
    return <div className="container mx-auto px-4 md:px-6 py-12"><LoadingLogo className="mx-auto" /></div>
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Classic Denim Jacket" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A short description of the product..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <FormField
                  control={form.control}
                  name="mrp_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MRP (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="1999.00" {...field} value={field.value || 0} />
                      </FormControl>
                       <FormDescription>
                        The original price (striked out).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meesho_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offer Price (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="999.00" {...field} />
                      </FormControl>
                       <FormDescription>
                        The final selling price.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={handleCategoryChange} value={field.value || ''} defaultValue="">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

               {availableSizes.length > 0 && (
                <FormField
                  control={form.control}
                  name="sizes"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Sizes</FormLabel>
                        <FormDescription>
                          Select the sizes available for this product.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {availableSizes.map((size) => (
                        <FormField
                          key={size}
                          control={form.control}
                          name="sizes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={size}
                                className="flex flex-row items-center space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(size)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), size])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== size
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {size}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Images</FormLabel>
                      <FormDescription>
                        Paste image URLs, one per line.
                      </FormDescription>
                      <FormControl>
                        <Textarea {...field} rows={5} placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.png" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               <div className="flex items-center space-x-8">
                 <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                            In Stock
                            </FormLabel>
                            <FormDescription>
                            Is this product available for purchase?
                            </FormDescription>
                        </div>
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                            Featured Product
                            </FormLabel>
                            <FormDescription>
                            Display this product on the home page.
                            </FormDescription>
                        </div>
                        </FormItem>
                    )}
                    />
               </div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <LoadingLogo className="mr-2 h-4 w-4" />
                    Updating...
                  </>
                ) : 'Update Product'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
