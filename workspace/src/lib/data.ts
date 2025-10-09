
'use server';

import type { Product } from './types';
import admin, { initAdmin } from './firebase/server';
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
  startAfter?: string;
  endBefore?: string;
} = {}): Promise<{products: Product[], lastVisibleId?: string, firstVisibleId?: string, hasMore: boolean}> => {
  await initAdmin();
  const adminDb = admin.firestore();
  const productsRef = adminDb.collection('products');
  let productsQuery: admin.firestore.Query = productsRef;

  // Apply category filter if not searching
  if (!filters.search && filters.category && filters.category !== 'all') {
    productsQuery = productsQuery.where('category', '==', filters.category);
  }

  const sort = filters.sort || 'newest';
  let sortField = 'createdAt';
  let sortDirection: 'asc' | 'desc' = 'desc';

  switch (sort) {
      case 'price-asc':
          sortField = 'final_price';
          sortDirection = 'asc';
          break;
      case 'price-desc':
          sortField = 'final_price';
          sortDirection = 'desc';
          break;
      case 'newest':
      default:
          sortField = 'createdAt';
          sortDirection = 'desc';
          break;
  }
  
  if (filters.endBefore) {
    productsQuery = productsQuery.orderBy(sortField, sortDirection === 'asc' ? 'desc' : 'asc');
  } else {
    productsQuery = productsQuery.orderBy(sortField, sortDirection);
  }

  // Handle pagination cursors
  if (filters.startAfter) {
      const startAfterDoc = await adminDb.collection('products').doc(filters.startAfter).get();
      if(startAfterDoc.exists) productsQuery = productsQuery.startAfter(startAfterDoc);
  }
  
  if (filters.endBefore) {
      const endBeforeDoc = await adminDb.collection('products').doc(filters.endBefore).get();
      if(endBeforeDoc.exists) productsQuery = productsQuery.startAfter(endBeforeDoc);
  }

  const limit = filters.limit ? filters.limit : 8;
  productsQuery = productsQuery.limit(limit + 1); // Fetch one extra to check for more pages
  
  const querySnapshot = await productsQuery.get();
  let products = querySnapshot.docs.map(productFromDoc);
  
  if (filters.endBefore) {
    products.reverse();
  }

  const hasMore = products.length > limit;
  if(hasMore) products.pop(); // Remove the extra item
  

  // Apply search filtering in-memory if a search term is provided
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    // Fetch all products if there is a search term, as Firestore doesn't support text search on multiple fields well.
    const allProductsSnapshot = await adminDb.collection('products').get();
    let allProducts = allProductsSnapshot.docs.map(productFromDoc);
    products = allProducts.filter(p => 
        p.title.toLowerCase().includes(searchTerm) || 
        p.category.toLowerCase().includes(searchTerm)
    );
     // Since search is in-memory, we ignore Firestore pagination results for hasMore
    return { products, hasMore: false };
  }

  const lastVisibleId = products.length > 0 ? products[products.length - 1].id : undefined;
  const firstVisibleId = products.length > 0 ? products[0].id : undefined;

  return { products, lastVisibleId, firstVisibleId, hasMore };
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

    if (limitCount) {
        productsQuery = productsQuery.limit(limitCount);
    }

    const querySnapshot = await productsQuery.get();
    return querySnapshot.docs.map(productFromDoc);
};
