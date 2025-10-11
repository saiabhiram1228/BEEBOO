'use server';

import Razorpay from 'razorpay';
import admin, { initAdmin } from './firebase/server';
import { Timestamp } from 'firebase-admin/firestore';
import type { CartItem, ShippingDetails, Order } from './types';
import crypto from 'crypto';
import { sendOrderConfirmationEmail } from './email';

// This function now handles the full Razorpay flow without webhooks.
export async function createOrderAndPayment(orderPayload: { cart: CartItem[], shippingDetails: ShippingDetails, total: number }, userId: string) {
    let firestoreOrderId: string | null = null;
    try {
        await initAdmin(); // Ensure Firebase is initialized
        const adminDb = admin.firestore();
        const { cart, shippingDetails, total } = orderPayload;

        // If Razorpay keys are not set, simulate a direct order for development.
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.warn("RAZORPAY keys not found. Simulating a direct order for development.");
            const simOrderData: Omit<Order, 'id'> = {
                userId,
                products: cart.map(item => ({ productId: item.id, name: item.name, price: item.price, quantity: item.quantity, image: item.image, size: item.size })),
                total,
                shippingAddress: shippingDetails,
                status: 'placed' as const,
                paymentStatus: 'paid' as const,
                createdAt: new Date(),
                razorpayOrderId: `sim_${new Date().getTime()}`,
            };
            const docRef = await adminDb.collection('orders').add({ ...simOrderData, createdAt: Timestamp.fromDate(simOrderData.createdAt) });
            
             // Send confirmation email for simulated order
            await sendOrderConfirmationEmail(shippingDetails, { id: docRef.id, ...simOrderData });

            return { data: { id: docRef.id, isDirectOrder: true }, error: null };
        }

        // --- Full Razorpay Flow ---
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        // 1. Create the order in Firestore with a 'pending' status.
        const orderData: Omit<Order, 'id'> = {
            userId,
            products: cart.map(item => ({ productId: item.id, name: item.name, price: item.price, quantity: item.quantity, image: item.image, size: item.size })),
            total,
            shippingAddress: shippingDetails,
            status: 'pending' as const,
            paymentStatus: 'pending' as const,
            createdAt: new Date(),
        };

        const docRef = await adminDb.collection('orders').add({
            ...orderData,
            createdAt: Timestamp.fromDate(orderData.createdAt)
        });
        firestoreOrderId = docRef.id;

        // 2. Create the order with Razorpay
        const amountInPaise = Math.round(total * 100);
        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: firestoreOrderId,
            notes: { 
                firestore_order_id: firestoreOrderId,
                user_id: userId,
            },
            partial_payment: false,
        };

        const razorpayOrder = await razorpay.orders.create(options);
        
        // 3. Update the Firestore order with the Razorpay Order ID
        await docRef.update({ razorpayOrderId: razorpayOrder.id });

        // 4. Return necessary details to the client
        return {
            data: {
                id: firestoreOrderId,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                isDirectOrder: false,
            },
            error: null
        };

    } catch (e: any) {
        console.error("🔥 A critical unexpected error occurred in createOrderAndPayment:", e);
        
        // Default error message
        let errorMessage = "An unexpected server error occurred. Please try again.";

        if (e.message) {
            errorMessage = e.message;
        }
        
        // If we created a firestore order but Razorpay failed, mark it as failed.
        if (firestoreOrderId) {
            try {
                await admin.firestore().collection('orders').doc(firestoreOrderId).update({
                    status: 'failed',
                    paymentStatus: 'failed',
                    error_message: e.message || 'Razorpay order creation failed.'
                });
            } catch (updateError) {
                console.error("🔥 Failed to update order status to failed:", updateError);
            }
        }
        
        return { data: null, error: errorMessage };
    }
}

export async function verifyPaymentAndUpdateOrder(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    firestore_order_id: string
) {
    await initAdmin(); // Ensure Firebase is initialized
    const adminDb = admin.firestore();
    const orderRef = adminDb.collection('orders').doc(firestore_order_id);

    try {
        const secret = process.env.RAZORPAY_KEY_SECRET!;
        if (!secret) {
            throw new Error("Razorpay secret key is not configured on the server.");
        }

        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            throw new Error('Payment verification failed: Invalid signature.');
        }

        // Fetch the order data to use for the email
        const orderSnapshot = await orderRef.get();
        if (!orderSnapshot.exists) {
            throw new Error(`Order ${firestore_order_id} not found in Firestore.`);
        }
        const orderData = orderSnapshot.data() as Omit<Order, 'id'>;

        // Update Firestore
        await orderRef.update({
            paymentStatus: 'paid',
            status: 'placed',
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
        });

        // Send confirmation email
        await sendOrderConfirmationEmail(orderData.shippingAddress, {
            id: firestore_order_id,
            total: orderData.total,
            products: orderData.products,
            razorpayPaymentId: razorpay_payment_id,
        });


        return { success: true, orderId: firestore_order_id };
    } catch (e: any) {
        console.error(`🔥 Payment verification/update failed for order ${firestore_order_id}:`, e);
        // Attempt to mark the order as failed in Firestore
        try {
            await orderRef.update({
                status: 'failed',
                paymentStatus: 'verification-failed',
                error_message: `Payment verification failed: ${e.message}`,
            });
        } catch (updateError) {
             console.error(`🔥 Additionally, failed to mark order ${firestore_order_id} as failed:`, updateError);
        }
        return { success: false, error: e.message || 'An unexpected error occurred during payment verification.' };
    }
}
