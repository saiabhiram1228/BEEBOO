
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
} = {}): Promise<Product[]> => {
  await initAdmin();
  const adminDb = admin.firestore();
  
  let productsQuery: admin.firestore.Query = adminDb.collection('products');

  // Apply category filter
  if (filters.category && filters.category !== 'all') {
    productsQuery = productsQuery.where('category', '==', filters.category);
  }
<<<<<<< HEAD
  
=======

  // Apply sorting *after* fetching if it's a default sort, to avoid index issues.
  if (filters.sort) {
     if (filters.sort === 'price-asc') {
      productsQuery = productsQuery.orderBy('final_price', 'asc');
    } else if (filters.sort === 'price-desc') {
      productsQuery = productsQuery.orderBy('final_price', 'desc');
    } else {
      productsQuery = productsQuery.orderBy('createdAt', 'desc');
    }
  } else {
     productsQuery = productsQuery.orderBy('createdAt', 'desc');
  }


  if (filters.limit) {
    productsQuery = productsQuery.limit(filters.limit);
  }

>>>>>>> 2bd9d7a (Try fixing this error: `Runtime Error: Error: 9 FAILED_PRECONDITION: The)
  const querySnapshot = await productsQuery.get();
  let products = querySnapshot.docs.map(productFromDoc);
  
<<<<<<< HEAD
  // Apply search filtering in-memory
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    products = products.filter(p => 
        p.title.toLowerCase().includes(searchTerm) || 
        p.description.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
    );
  }

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

  // Apply limit after sorting
  if (filters.limit) {
    products = products.slice(0, filters.limit);
=======
  // Apply sorting in-memory if it wasn't handled by the query
  const sort = filters.sort || 'newest';
  if (sort) {
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
>>>>>>> 2bd9d7a (Try fixing this error: `Runtime Error: Error: 9 FAILED_PRECONDITION: The)
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

    if (limitCount) {
        productsQuery = productsQuery.limit(limitCount);
    }

    const querySnapshot = await productsQuery.get();
    return querySnapshot.docs.map(productFromDoc);
};
