
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getOrdersByUserId } from '@/lib/data';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import LoadingLogo from '@/components/shop/loading-logo';

function OrderHistoryList({ orders, loading }: { orders: Order[], loading: boolean }) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
        );
    }
    
    if (orders.length === 0) {
        return (
            <div className="text-center py-16 flex flex-col items-center">
                <ShoppingBag className="h-20 w-20 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold">You haven't placed any orders yet.</h2>
                <p className="text-muted-foreground mt-2">
                    When you do, they will appear here.
                </p>
                 <Button asChild className="mt-6" variant="outline">
                    <Link href="/products">Start Shopping</Link>
                </Button>
            </div>
        )
    }

    return (
        <Accordion type="single" collapsible className="w-full space-y-4">
            {orders.map((order) => (
                <AccordionItem key={order.id} value={order.id} className="border-b-0">
                    <Card>
                        <AccordionTrigger className="w-full hover:bg-muted/50 px-4 py-0 rounded-t-lg">
                           <div className="grid grid-cols-2 md:grid-cols-4 w-full items-center text-left py-4 text-sm gap-2">
                                <div className="font-medium">
                                    <span className="md:hidden font-normal text-muted-foreground">ID: </span>
                                    <span className="font-mono text-xs">{order.id.substring(0, 6)}...</span>
                                </div>
                                <div className="text-muted-foreground">
                                    <span className="md:hidden">Date: </span>
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex flex-col items-start md:items-center">
                                    <Badge variant={order.status === 'placed' ? 'secondary' : 'default'} className="capitalize text-xs">{order.status}</Badge>
                                </div>
                                <div className="text-right font-medium">₹{order.total.toFixed(2)}</div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                             <div className="p-4 bg-muted/20 rounded-b-lg border-t">
                                <h4 className="font-semibold mb-4 text-base">Order Details</h4>
                                <div className="space-y-4">
                                     {order.products.map(p => (
                                        <div key={p.productId} className="flex items-center gap-4">
                                            <Image src={p.image} alt={p.name} width={60} height={75} quality={100} className="rounded-md object-cover aspect-[4/5] border" />
                                            <div className="flex-grow">
                                                <p className="font-medium">{p.name}</p>
                                                <p className="text-sm text-muted-foreground">Size: {p.size}</p>
                                                 <p className="text-sm text-muted-foreground">Qty: {p.quantity}</p>
                                            </div>
                                            <div className="text-sm font-medium text-right">
                                                <p>₹{(p.quantity * p.price).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t text-sm">
                                    <p className="font-semibold">Shipping To:</p>
                                    <div className="text-muted-foreground">
                                        <p>{order.shippingAddress.name}</p>
                                        <p>{order.shippingAddress.houseNumber}, {order.shippingAddress.buildingName}</p>
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            ))}
        </Accordion>
    );
}


export default function OrderHistoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login?redirect=/order-history');
            } else {
                const fetchOrders = async () => {
                    setLoading(true);
                    const userOrders = await getOrdersByUserId(user.uid);
                    setOrders(userOrders);
                    setLoading(false);
                };
                fetchOrders();
            }
        }
    }, [user, authLoading, router]);

    if (authLoading || !user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingLogo />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <h1 className="text-3xl font-bold font-headline mb-8">My Order History</h1>
            <OrderHistoryList orders={orders} loading={loading} />
        </div>
    );
}
