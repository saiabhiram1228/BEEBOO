
'use server';
import { z } from 'zod';
import { admin, initAdmin } from './firebase/server';
import { Timestamp } from 'firebase-admin/firestore';
import type { Category } from './types';


const categorySchema = z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters'),
    isApparel: z.boolean().default(false),
});

export async function addCategory(data: { name: string, isApparel: boolean }) {
    const validation = categorySchema.safeParse(data);

    if (!validation.success) {
        throw new Error('Invalid category data');
    }

    await initAdmin();
    const adminDb = admin.firestore();
    const categoriesRef = adminDb.collection('categories');

    
    const docRef = await categoriesRef.add({
        ...validation.data,
        createdAt: Timestamp.now(),
    });
    return { id: docRef.id };
    
}

export async function updateCategory(id: string, data: { name: string, isApparel: boolean }) {
    const validation = categorySchema.safeParse(data);

    if (!validation.success) {
        throw new Error('Invalid category data');
    }

    await initAdmin();
    const adminDb = admin.firestore();
    const categoryRef = adminDb.collection('categories').doc(id);

    
    await categoryRef.update(validation.data);
    return { id };
    
}
