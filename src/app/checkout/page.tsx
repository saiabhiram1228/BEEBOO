
'use client';

import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';
import { verifyPaymentAndUpdateOrder } from '@/lib/order-actions';
import { getIdToken } from 'firebase/auth';
import LoadingLogo from '@/components/shop/loading-logo';

const shippingSchema = z.object({
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

type ShippingFormData = z.infer<typeof shippingSchema>;

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
  const { cart, total, subtotal, shippingFee, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      houseNumber: '',
      buildingName: '',
      street: '',
      pincode: '',
      city: '',
      state: '',
      landmark: '',
    },
  });

   useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to proceed with checkout.",
          variant: "destructive"
        });
        router.push('/login?redirect=/checkout');
      } else if (cart.length === 0 && !isSubmitting) {
        router.push('/products');
      }
    }
  }, [user, authLoading, cart, router, isSubmitting, toast]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      form.setValue('name', user.displayName || '');
      form.setValue('email', user.email || '');
      form.setValue('phoneNumber', user.phoneNumber || '');
    }
  }, [user, form]);

  const onSubmit = async (data: ShippingFormData) => {
    setIsSubmitting(true);
    if (!user) {
        toast({
            title: "Not Logged In",
            description: "You must be logged in to place an order.",
            variant: "destructive"
        });
        setIsSubmitting(false);
        router.push('/login?redirect=/checkout');
        return;
    }

    toast({
        title: "Placing Order...",
        description: "Please wait while we process your request."
    });

    try {
        const idToken = await getIdToken(user);
        const orderPayload = {
            cart: cart.map(item => ({...item, productId: item.id})), // Pass full cart item details
            shippingDetails: data,
            total: total,
        };

        const response = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(orderPayload),
        });
        
        let result;
        const responseText = await response.text();
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          console.error("🔥 Failed to parse API response as JSON:", responseText);
          throw new Error("The server returned an invalid response. Please try again.");
        }

        if (!response.ok) {
            console.error("🔥 API returned an error:", result);
            throw new Error(result.error || 'Failed to create order.');
        }

        // If 'isDirectOrder' is true, it's a simulated order. No payment needed.
        if (result.isDirectOrder) {
            clearCart();
            toast({
                title: "Order Confirmed!",
                description: `Your order #${result.id.substring(0, 6)} has been placed.`,
            });
            router.push(`/order-confirmation?orderId=${result.id}`);
            return;
        }

        // Proceed with Razorpay payment
        const { id: firestoreOrderId, razorpayOrderId, amount } = result;

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: amount,
            currency: 'INR',
            name: 'BEE BOO',
            description: `Order #${firestoreOrderId.substring(0,6)}`,
            order_id: razorpayOrderId,
            handler: async function (paymentResponse: any) {
                // Payment successful, now verify on server
                toast({ title: "Payment Successful!", description: "Finalizing your order..." });

                const verificationResult = await verifyPaymentAndUpdateOrder(
                    paymentResponse.razorpay_order_id,
                    paymentResponse.razorpay_payment_id,
                    paymentResponse.razorpay_signature,
                    firestoreOrderId
                );

                if (verificationResult.success) {
                    clearCart();
                    toast({
                        title: "Order Confirmed!",
                        description: "A confirmation will be sent to you shortly.",
                    });
                    router.push(`/order-confirmation?orderId=${verificationResult.orderId}&paymentId=${paymentResponse.razorpay_payment_id}`);
                } else {
                     toast({
                        variant: 'destructive',
                        title: 'Verification Failed',
                        description: verificationResult.error || 'Could not confirm your order. Please contact support.',
                    });
                    setIsSubmitting(false);
                }
            },
            prefill: {
                name: data.name,
                email: data.email,
                contact: data.phoneNumber,
            },
            notes: {
                firestore_order_id: firestoreOrderId
            },
            theme: {
                color: '#000000'
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (failResponse: any) {
            console.error("Razorpay Payment Failed:", failResponse.error);
            toast({
                variant: 'destructive',
                title: 'Payment Failed',
                description: failResponse.error.description || 'Please try again.',
            });
            setIsSubmitting(false);
        });
        rzp.open();

    } catch (error: any) {
        console.error("🔥 Failed to process order:", error);
        toast({
            variant: "destructive",
            title: "Order Failed",
            description: error.message || "There was a problem placing your order. Please try again.",
        });
        setIsSubmitting(false);
    }
  };

  if (authLoading || !user || (cart.length === 0 && !isSubmitting)) {
    return (
        <div className="flex items-center justify-center h-screen">
            <LoadingLogo />
        </div>
    );
  }

  return (
    <>
    <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
    />
    <div className="container mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold font-headline mb-8">Checkout</h1>
      <div className="grid md:grid-cols-[1fr_400px] gap-12 items-start">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Delivery &amp; Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                      <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  
                  <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="For order confirmation" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <Separator className="my-6"/>
                   <h3 className="text-lg font-medium">Shipping Address</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="houseNumber" render={({ field }) => (
                        <FormItem><FormLabel>House / Flat No.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="buildingName" render={({ field }) => (
                        <FormItem><FormLabel>Building / Apartment</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  
                  <FormField control={form.control} name="street" render={({ field }) => (
                    <FormItem><FormLabel>Area / Street</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="landmark" render={({ field }) => (
                    <FormItem><FormLabel>Landmark (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="pincode" render={({ field }) => (
                      <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  
                  <Button type="submit" size="lg" className="w-full mt-6" variant="outline" disabled={isSubmitting || !razorpayLoaded}>
                    {isSubmitting ? <span className="flex items-center"><LoadingLogo className="mr-2 h-5 w-5" />Processing...</span> : `Proceed to Pay - ₹${total.toFixed(2)}`}
                  </Button>
                  {!razorpayLoaded && <p className="text-center text-sm text-muted-foreground mt-2">Loading payment gateway...</p>}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Image src={item.image} alt={item.name} width={50} height={65} quality={100} className="rounded-md object-cover" />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <p>Subtotal</p>
                <p>₹{subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <p>Shipping</p>
                <p>₹{shippingFee.toFixed(2)}</p>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>₹{total.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}
