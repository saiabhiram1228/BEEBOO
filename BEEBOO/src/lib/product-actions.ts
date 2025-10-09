
'use server';

import { z } from 'zod';
import type { Product, ProductFormData } from './types';
import { admin, initAdmin } from './firebase/server';
import { Timestamp } from 'firebase-admin/firestore';

const handleFirestoreError = (error: unknown, context?: string) => {
  const defaultError = new Error(
    'Firestore Permission Denied. Please check your Firestore security rules in the Firebase Console.'
  );

  if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
    const firestoreError = error as { code: string; message: string };

    console.error(
      `Firestore Error (${context || 'general'}):`,
      firestoreError.code,
      firestoreError.message
    );

    if (firestoreError.code === 'permission-denied' || firestoreError.code === 'unauthenticated') {
      throw defaultError;
    } else {
      throw new Error('A Firestore error occurred. Check the server console for details.');
    }
  }

  console.error("An unexpected error occurred:", error);
  throw new Error('Failed to communicate with the database. Check the console for more details.');
};


const addProductToDb = async (productData: Omit<Product, 'id' | 'final_price'> & {createdAt: Timestamp}) => {
    await initAdmin();
    const adminDb = admin.firestore();
    const productsRef = adminDb.collection('products');
    const final_price = productData.meesho_price;
    const docRef = await productsRef.add({...productData, final_price});
    return docRef.id;
}


const updateProductInDb = async (productId: string, productData: Partial<Omit<Product, 'id' | 'final_price'>>) => {
    await initAdmin();
    const adminDb = admin.firestore();
    const productRef = adminDb.collection('products').doc(productId);
    const updateData: any = {...productData};
    if (productData.meesho_price !== undefined) {
        updateData.final_price = productData.meesho_price;
    }
    await productRef.update(updateData);
}


const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  mrp_price: z.coerce.number().min(0, 'MRP must be a positive number').optional(),
  meesho_price: z.coerce.number().min(0, 'Price must be a positive number'),
  category: z.string().min(1, 'Please select a category'),
  images: z.string()
    .min(1, 'At least one image URL is required')
    .transform(val => val.split('\n').filter(url => url.trim() !== '')),
  stock: z.boolean().default(true),
  featured: z.boolean().default(false),
  sizes: z.array(z.string()).optional(),
}).refine(data => !data.mrp_price || data.mrp_price >= data.meesho_price, {
    message: "Offer price cannot be greater than MRP",
    path: ["meesho_price"],
});

export async function addProduct(data: ProductFormData) {
  const validation = productSchema.safeParse(data);

  if (!validation.success) {
    console.error("Product validation failed:", validation.error.flatten().fieldErrors);
    throw new Error('Invalid product data');
  }

  try {
    const { sizes, ...rest } = validation.data;
    const newProductData = {
      ...rest,
      mrp_price: rest.mrp_price || null,
      sizes: sizes || [],
      createdAt: Timestamp.fromDate(new Date()),
    };
    const newId = await addProductToDb(newProductData);
    return { id: newId };
  } catch (error) {
    handleFirestoreError(error, 'addProduct');
    // This part of the return is for consistency, but the error is thrown above.
    return { error: 'Failed to add product.' };
  }
}

export async function updateProduct(id: string, data: ProductFormData) {
  const validation = productSchema.safeParse(data);

  if (!validation.success) {
    console.error("Product validation failed:", validation.error.flatten().fieldErrors);
    throw new Error('Invalid product data');
  }
  
  try {
    const { sizes, ...rest } = validation.data;
    const updatedProductData = {
      ...rest,
      mrp_price: rest.mrp_price || null,
      sizes: sizes || [],
    };
    await updateProductInDb(id, updatedProductData);
    return { id };
  } catch (error) {
    handleFirestoreError(error, 'updateProduct');
     // This part of the return is for consistency, but the error is thrown above.
    return { error: 'Failed to update product.' };
  }
}
