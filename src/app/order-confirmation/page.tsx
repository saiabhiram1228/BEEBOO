
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <div className="container mx-auto px-4 md:px-6 py-12 flex items-center justify-center">
            <Card className="w-full max-w-lg text-center shadow-xl">
                <CardHeader>
                    <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <CardTitle className="text-3xl font-bold font-headline mt-4">Thank You for Your Order!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Your order has been placed successfully. A confirmation email will be sent to you shortly.
                    </p>
                    {orderId && (
                        <p className="mt-2 text-sm text-muted-foreground">
                            Order ID: <span className="font-medium text-foreground">{orderId}</span>
                        </p>
                    )}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                        <Button asChild size="lg" variant="outline">
                        <Link href="/">Continue Shopping</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}


export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading confirmation...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
