
'use server';

import type { Order } from './types';
import { admin, initAdmin } from './firebase/server'; 
import { Timestamp } from 'firebase-admin/firestore'; 


export interface DashboardStats {
  totalSales: number;
  salesThisMonth: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  outOfStockProducts: number;
}


async function getAllOrders(): Promise<Order[]> {
    await initAdmin();
    const adminDb = admin.firestore();
    const ordersRef = adminDb.collection('orders');
    const q = ordersRef.orderBy('createdAt', 'desc');
    const querySnapshot = await q.get();

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as Order;
    });
}

async function getAllProducts() {
    await initAdmin();
    const adminDb = admin.firestore();
    const snapshot = await adminDb.collection('products').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}


export async function getDashboardStats(): Promise<DashboardStats> {
  await initAdmin();
  const defaultStats: DashboardStats = {
    totalSales: 0,
    salesThisMonth: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    outOfStockProducts: 0,
  };
  
  const products = await getAllProducts();
  const orders = await getAllOrders();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalSales = orders.reduce((sum, order) => order.paymentStatus === 'paid' ? sum + order.total : sum, 0);
  const salesThisMonth = orders.reduce((sum, order) => {
    return order.paymentStatus === 'paid' && new Date(order.createdAt) >= startOfMonth ? sum + order.total : sum;
  }, 0);
  
  const stats: DashboardStats = {
    totalSales: totalSales,
    salesThisMonth: salesThisMonth,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'placed' && o.paymentStatus !== 'paid').length,
    totalProducts: products.length,
    outOfStockProducts: products.filter(p => !p.stock).length,
  };
  
  return Promise.resolve(stats);
}

export async function getRecentOrders(count?: number): Promise<Order[]> {
    await initAdmin();
    const adminDb = admin.firestore();
    const ordersRef = adminDb.collection('orders');
    let q = ordersRef.orderBy('createdAt', 'desc');

    if (count) {
      q = q.limit(count);
    }

    const querySnapshot = await q.get();
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as Order;
    });
}

export async function updateAnnouncement(text: string): Promise<void> {
    await initAdmin();
    const adminDb = admin.firestore();
    const settingsRef = adminDb.collection('settings').doc('announcement');
    await settingsRef.set({
        text,
        updatedAt: Timestamp.now(),
    }, { merge: true });
}

export async function getAnnouncement(): Promise<string | null> {
    await initAdmin();
    const adminDb = admin.firestore();
    const settingsRef = adminDb.collection('settings').doc('announcement');
    const doc = await settingsRef.get();

    if (doc.exists) {
        return doc.data()?.text || null;
    }
    return null;
}

export async function updateFestivalTheme(theme: string): Promise<void> {
    await initAdmin();
    const adminDb = admin.firestore();
    const settingsRef = adminDb.collection('settings').doc('festivalTheme');
    await settingsRef.set({
        activeTheme: theme,
        updatedAt: Timestamp.now(),
    }, { merge: true });
}

export async function getFestivalTheme(): Promise<string | null> {
    await initAdmin();
    const adminDb = admin.firestore();
    const settingsRef = adminDb.collection('settings').doc('festivalTheme');
    const doc = await settingsRef.get();

    if (doc.exists) {
        return doc.data()?.activeTheme || null;
    }
    return null;
}
