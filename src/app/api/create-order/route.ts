'use server';
import { NextRequest, NextResponse } from 'next/server';
import { createOrderAndPayment } from '@/lib/order-actions';
import { z } from 'zod';
import admin, { initAdmin } from '@/lib/firebase/server';

const shippingDetailsSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  email: z.string().email('Invalid email address'),
  houseNumber: z.string().min(1, 'House/Flat number is required'),
  buildingName: z.string().min(1, 'Building/Apartment name is required'),
  street: z.string().min(3, 'Area/Street is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid Pincode'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  landmark: z.string().optional(),
});

const orderSchema = z.object({
  cart: z.array(z.object({
    id: z.string(),
    productId: z.string(),
    name: z.string(),
    price: z.number(),
    image: z.string(),
    quantity: z.number().min(1),
    size: z.string(),
  })).min(1, "Cart cannot be empty."),
  shippingDetails: shippingDetailsSchema,
  total: z.number(),
});


export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Authentication required. Please log in.' }, { status: 401 });
    }

    await initAdmin();
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    
    const rawData = await req.json();
    console.log("🟢 Incoming order payload:", rawData);

    const validation = orderSchema.safeParse(rawData);

    if (!validation.success) {
      console.error('🔥 API Validation Error in /api/create-order:', validation.error.issues);
      return NextResponse.json({ error: 'Invalid order data submitted.', details: validation.error.flatten() }, { status: 400 });
    }
    
    const result = await createOrderAndPayment(validation.data, userId);

    if (result.error) {
        console.error("🔥 Error from order action:", result.error);
        return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    // Success, return the data to the client
    console.log("✅ Order processed successfully:", result.data);
    return NextResponse.json(result.data);

  } catch (error: any) {
     if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
      return NextResponse.json({ error: 'Your session has expired. Please log in again.' }, { status: 401 });
    }
    // This is a master catch-all for any unexpected errors in the API route itself.
    console.error('🔥 FATAL Unhandled API Route Error in /api/create-order:', error);
    return NextResponse.json({ error: 'An unexpected internal server error occurred.' }, { status: 500 });
  }
}
