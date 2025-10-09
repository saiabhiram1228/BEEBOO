// This is a server-side file.
'use server';

/**
 * @fileOverview Provides product recommendations based on items in the user's cart.
 *
 * - getCartItemRecommendations - A function that suggests similar or complementary products based on the items in the cart.
 * - CartItemRecommendationsInput - The input type for the getCartItemRecommendations function.
 * - CartItemRecommendationsOutput - The return type for the getCartItemRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getProducts } from '@/lib/data';
import type { Product } from '@/lib/types';

const CartItemSchema = z.object({
  productId: z.string().describe('The unique identifier for the product.'),
  name: z.string().describe('The name of the product.'),
  category: z.string().describe('The category of the product.'),
  description: z.string().describe('A short description of the product.'),
});

export type CartItem = z.infer<typeof CartItemSchema>;

const CartItemRecommendationsInputSchema = z.object({
  cartItems: z.array(CartItemSchema).describe('The items currently in the user\'s cart.'),
  maxRecommendations: z.number().int().min(1).max(10).default(3).describe('The maximum number of product recommendations to return.'),
});

export type CartItemRecommendationsInput = z.infer<typeof CartItemRecommendationsInputSchema>;

const RecommendedProductSchema = z.object({
  productId: z.string().describe('The unique identifier for the recommended product from the available products list.'),
  name: z.string().describe('The name of the recommended product.'),
  description: z.string().describe('A short description of why this product is recommended based on the cart contents.'),
});

const CartItemRecommendationsOutputSchema = z.object({
  recommendations: z.array(RecommendedProductSchema).describe('A list of recommended products based on the cart items.'),
});

export type CartItemRecommendationsOutput = z.infer<typeof CartItemRecommendationsOutputSchema>;

export async function getCartItemRecommendations(input: CartItemRecommendationsInput): Promise<CartItemRecommendationsOutput> {
  return cartItemRecommendationsFlow(input);
}

const cartItemRecommendationsPrompt = ai.definePrompt({
  name: 'cartItemRecommendationsPrompt',
  input: {schema: z.object({
    cartItems: CartItemRecommendationsInputSchema.shape.cartItems,
    maxRecommendations: CartItemRecommendationsInputSchema.shape.maxRecommendations,
    availableProducts: z.array(z.object({
      id: z.string(),
      title: z.string(),
      category: z.string(),
      description: z.string(),
    })).describe('A list of all available products in the store.')
  })},
  output: {schema: CartItemRecommendationsOutputSchema},
  prompt: `You are a shopping assistant who suggests similar or complementary products based on the items in the user's cart.

  The user has the following items in their cart:
  {{#each cartItems}}
  - Product ID: {{productId}}, Name: {{name}}, Category: {{category}}, Description: {{description}}
  {{/each}}

  Here is a list of available products in the store:
  {{#each availableProducts}}
  - Product ID: {{id}}, Name: {{title}}, Category: {{category}}, Description: {{description}}
  {{/each}}

  Suggest up to {{maxRecommendations}} additional products from the "available products" list that the user might be interested in.
  - Only recommend products that are present in the "available products" list.
  - Use the exact productId from the list for your recommendations.
  - Do not recommend products that are already in the user's cart.
  - Provide a brief description of why each product is a good recommendation.

  Format your response as a JSON object with a "recommendations" array. Each object in the array should have 'productId', 'name', and 'description' fields.
  `,
});

const cartItemRecommendationsFlow = ai.defineFlow(
  {
    name: 'cartItemRecommendationsFlow',
    inputSchema: CartItemRecommendationsInputSchema,
    outputSchema: CartItemRecommendationsOutputSchema,
  },
  async input => {
    // Fetch all products to provide as context to the model.
    const allProducts = await getProducts();
    const availableProducts = allProducts.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        description: p.description
    }));

    const {output} = await cartItemRecommendationsPrompt({
        ...input,
        availableProducts,
    });
    return output!;
  }
);
