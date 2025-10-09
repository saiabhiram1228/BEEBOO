
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
} = {}): Promise<Product[]> => {
  await initAdmin();
  const adminDb = admin.firestore();
  const productsRef = adminDb.collection('products');
  let productsQuery: admin.firestore.Query = productsRef;

  // If there's a search term, we should ignore the category for a global search.
  // Otherwise, filter by category if one is provided.
  if (!filters.search && filters.category && filters.category !== 'all') {
    productsQuery = productsQuery.where('category', '==', filters.category);
  }

  const querySnapshot = await productsQuery.get();
  let products = querySnapshot.docs.map(productFromDoc);

  // Apply search filtering in-memory on all fetched products
  if (filters.search) {
    products = products.filter(p => p.title.toLowerCase().includes(filters.search!.toLowerCase()));
  }
  
  // Apply sorting in-memory
  const sort = filters.sort || 'newest';
  products.sort((a, b) => {
      switch (sort) {
          case 'price-asc':
              return a.final_price - b.final_price;
          case 'price-desc':
              return b.final_price - a.final_price;
          case 'newest':
          default:
               // Ensure createdAt is valid for sorting
              const dateA = a.createdAt ? a.createdAt.getTime() : 0;
              const dateB = b.createdAt ? b.createdAt.getTime() : 0;
              return dateB - dateA;
      }
  });

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
    const productsQuery = adminDb.collection('products').orderBy('createdAt', 'desc');
    
    const querySnapshot = await productsQuery.get();
    const allProducts = querySnapshot.docs.map(productFromDoc);
    
    const featured = allProducts.filter(p => p.featured);

    if (limitCount) {
        return featured.slice(0, limitCount);
    }

    return featured;
};
