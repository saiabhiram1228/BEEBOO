
'use server';

import type { Product } from './types';
import { admin, initAdmin } from './firebase/server';
import { Timestamp } from 'firebase-admin/firestore';

const productFromDoc = (docSnap: admin.firestore.DocumentSnapshot): Product => {
  const data = docSnap.data()!;
  const meesho_price = data.meesho_price || 0;
  const mrp_price = data.mrp_price;
  let discount_percentage;

  if (mrp_price && mrp_price > meesho_price) {
    discount_percentage = Math.round(((mrp_price - meesho_price) / mrp_price) * 100);
  }

  return {
    id: docSnap.id,
    title: data.title,
    description: data.description,
    images: data.images,
    mrp_price: mrp_price,
    meesho_price: meesho_price,
    final_price: meesho_price,
    discount_percentage: discount_percentage,
    category: data.category,
    featured: data.featured,
    stock: data.stock,
    sizes: data.sizes || [],
    createdAt: (data.createdAt as Timestamp)?.toDate(),
  };
};

export const getProducts = async (filters: {
  category?: string;
  sort?: string;
  search?: string;
  limit?: number;
} = {}): Promise<Product[]> => {
  await initAdmin();
  const adminDb = admin.firestore();
  
  let productsQuery: admin.firestore.Query = adminDb.collection('products');

  // Apply category filter
  if (filters.category && filters.category !== 'all') {
    productsQuery = productsQuery.where('category', '==', filters.category);
  }
  
  // For search, we must fetch all and filter in memory since Firestore doesn't support
  // multi-field text search natively.
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    const allProductsSnapshot = await productsQuery.get();
    let allProducts = allProductsSnapshot.docs.map(productFromDoc);
    
    return allProducts.filter(p => 
        p.title.toLowerCase().includes(searchTerm) || 
        p.description.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
    );
  }

  // Apply limit ONLY if it's explicitly provided. Otherwise, fetch all.
  if (filters.limit) {
    productsQuery = productsQuery.limit(filters.limit);
  }
  
  const querySnapshot = await productsQuery.get();
  let products = querySnapshot.docs.map(productFromDoc);
  
  // Apply sorting in-memory
  const sort = filters.sort || 'newest';
  switch (sort) {
      case 'price-asc':
          products.sort((a, b) => a.final_price - b.final_price);
          break;
      case 'price-desc':
          products.sort((a, b) => b.final_price - a.final_price);
          break;
      case 'newest':
      default:
          products.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
          break;
  }

  return products;
};


export const getProductById = async (id: string): Promise<Product | undefined> => {
  await initAdmin();
  const adminDb = admin.firestore();
  const productRef = adminDb.collection('products').doc(id);
  const docSnap = await productRef.get();

  if (docSnap.exists) {
    return productFromDoc(docSnap);
  } else {
    return undefined;
  }
};

export const getFeaturedProducts = async (limitCount?: number): Promise<Product[]> => {
    await initAdmin();
    const adminDb = admin.firestore();
    let productsQuery: admin.firestore.Query = adminDb.collection('products')
        .where('featured', '==', true)
        .orderBy('createdAt', 'desc');
    
    // Shuffle the featured products array for variety
    const querySnapshot = await productsQuery.get();
    let featuredProducts = querySnapshot.docs.map(productFromDoc);
    
    for (let i = featuredProducts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [featuredProducts[i], featuredProducts[j]] = [featuredProducts[j], featuredProducts[i]];
    }
    
    if (limitCount) {
        return featuredProducts.slice(0, limitCount);
    }

    return featuredProducts;
};
