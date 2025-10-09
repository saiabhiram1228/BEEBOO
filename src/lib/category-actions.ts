'use server';
import { z } from 'zod';
import admin, { initAdmin } from './firebase/server';
import { Timestamp } from 'firebase-admin/firestore';
import type { Category } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

    try {
        const docRef = await categoriesRef.add({
            ...validation.data,
            createdAt: Timestamp.now(),
        });
        return { id: docRef.id };
    } catch (serverError: any) {
        const permissionError = new FirestorePermissionError({
            path: categoriesRef.path,
            operation: 'create',
            requestResourceData: validation.data,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    }
}

export async function updateCategory(id: string, data: { name: string, isApparel: boolean }) {
    const validation = categorySchema.safeParse(data);

    if (!validation.success) {
        throw new Error('Invalid category data');
    }

    await initAdmin();
    const adminDb = admin.firestore();
    const categoryRef = adminDb.collection('categories').doc(id);

    try {
        await categoryRef.update(validation.data);
        return { id };
    } catch (serverError: any) {
        const permissionError = new FirestorePermissionError({
            path: categoryRef.path,
            operation: 'update',
            requestResourceData: validation.data,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    }
}
