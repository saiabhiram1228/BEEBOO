
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import Link from 'next/link';
import { IndianRupee, Package, PlusCircle, ShoppingCart, Users, Pencil, PartyPopper } from 'lucide-react';
import { getDashboardStats, DashboardStats, getRecentOrders, getAnnouncement, updateAnnouncement, getFestivalTheme, updateFestivalTheme } from '@/lib/admin-data';
import type { Order } from '@/lib/types';
import { getProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingLogo from '@/components/shop/loading-logo';

const festivalThemes = [
    { id: 'none', name: 'Off' },
    { id: 'header-lights', name: 'Header Lights' },
    { id: 'diwali', name: 'Diwali' },
    { id: 'holi', name: 'Holi' },
    { id: 'navratri', name: 'Navratri' },
    { id: 'ganesh-chaturthi', name: 'Ganesh Chaturthi' },
    { id: 'dussehra', name: 'Dussehra' },
    { id: 'independence-day', name: 'Independence Day' },
    { id: 'republic-day', name: 'Republic Day' },
    { id: 'eid', name: 'Eid-ul-Fitr' },
    { id: 'onam', name: 'Onam' },
    { id: 'shivratri', name: 'Maha Shivratri' },
    { id: 'raksha-bandhan', name: 'Raksha Bandhan' },
    { id: 'pongal', name: 'Pongal' },
    { id: 'makar-sankranti', name: 'Makar Sankranti / Lohri' },
];


function StatCard({ title, value, icon, description, loading }: { title: string; value: string | number; icon: React.ReactNode; description?: string, loading: boolean }) {
    if (loading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    {icon}
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                </CardContent>
            </Card>
        );
    }
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    );
}

function RecentOrders({ orders, loading }: { orders: Order[], loading: boolean }) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
                <CardTitle>All Orders</CardTitle>
            </CardHeader>
            <CardContent>
                 <ScrollArea className="h-[400px]">
                    <Accordion type="single" collapsible className="w-full">
                        <div className="hidden md:grid grid-cols-[100px_1fr_1fr_1fr_auto_auto] items-center px-4 py-2 border-b text-sm font-medium text-muted-foreground sticky top-0 bg-background z-10">
                            <div className="w-[100px]">Order ID</div>
                            <div>Date</div>
                            <div>Customer</div>
                            <div className="text-right">Amount</div>
                            <div className="text-center">Status</div>
                            <div className="w-8"></div>
                        </div>
                        {orders.map((order) => (
                            <AccordionItem key={order.id} value={order.id}>
                                <AccordionTrigger className="w-full hover:bg-muted/50 px-4 py-0">
                                    <div className="grid grid-cols-2 md:grid-cols-[100px_1fr_1fr_1fr_auto_auto] w-full items-center text-left py-4">
                                        <div className="font-medium w-[100px] truncate md:pr-4"><span className="md:hidden font-normal text-muted-foreground">ID: </span>{order.id.substring(0, 6)}...</div>
                                        <div className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</div>
                                        <div className="col-span-2 md:col-span-1 text-sm truncate pr-4">{order.shippingAddress.name}</div>
                                        <div className="text-right font-medium">₹{order.total.toFixed(2)}</div>
                                        <div className="flex flex-col items-end md:items-center">
                                        <Badge variant={order.status === 'placed' ? 'secondary' : 'default'} className="capitalize text-xs">{order.status}</Badge>
                                        <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'} className="capitalize text-xs mt-1">{order.paymentStatus}</Badge>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="p-4 bg-muted/50 rounded-md">
                                        <div className="grid md:grid-cols-3 gap-6">
                                            <div className="md:col-span-1 space-y-3">
                                                <h4 className="font-semibold">Customer Details</h4>
                                                <div className="text-sm">
                                                    <p className="font-medium">{order.shippingAddress.name}</p>
                                                    <p className="text-muted-foreground">{order.shippingAddress.email}</p>
                                                    <p className="text-muted-foreground">{order.shippingAddress.phoneNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium">Shipping Address</p>
                                                    <div className="text-sm text-muted-foreground">
                                                        <p>{order.shippingAddress.houseNumber}, {order.shippingAddress.buildingName}</p>
                                                        <p>{order.shippingAddress.street}</p>
                                                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                                        {order.shippingAddress.landmark && <p>Landmark: {order.shippingAddress.landmark}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 space-y-3">
                                                <h4 className="font-semibold">Products</h4>
                                                <div className="space-y-2">
                                                    {order.products.map(p => (
                                                        <div key={p.productId} className="flex items-center gap-4 p-2 rounded-md border bg-background">
                                                            <Image src={p.image} alt={p.name} width={50} height={65} quality={100} className="rounded-sm object-cover aspect-[4/5]" />
                                                            <div className="flex-grow">
                                                                <p className="font-medium">{p.name}</p>
                                                                <p className="text-sm text-muted-foreground">Size: {p.size}</p>
                                                            </div>
                                                            <div className="text-sm text-right">
                                                                <p>Qty: {p.quantity}</p>
                                                                <p>@ ₹{p.price.toFixed(2)}</p>
                                                                <p className="font-medium">Total: ₹{(p.quantity * p.price).toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t">
                                            <p className="text-sm"><span className="font-semibold">Razorpay Order ID:</span> <span className="text-muted-foreground font-mono text-xs">{order.razorpayOrderId || 'N/A'}</span></p>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </ScrollArea>
                {orders.length === 0 && <p className="text-center text-muted-foreground py-8">No orders yet.</p>}
            </CardContent>
        </Card>
    )
}

function AllProducts({ products, loading }: { products: Product[], loading: boolean }) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>All Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
                <CardTitle>All Products</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>MRP</TableHead>
                            <TableHead>Offer Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Featured</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map(product => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <Image src={product.images[0]} alt={product.title} width={40} height={50} quality={100} className="rounded-sm object-cover" />
                                </TableCell>
                                <TableCell className="font-medium">{product.title}</TableCell>
                                <TableCell>₹{product.mrp_price?.toFixed(2) || '-'}</TableCell>
                                <TableCell>₹{product.final_price.toFixed(2)}</TableCell>
                                <TableCell>{product.stock ? 'In Stock' : 'Out of Stock'}</TableCell>
                                <TableCell>{product.featured ? 'Yes' : 'No'}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/edit-product/${product.id}`}>
                                            <Pencil className="mr-2 h-3 w-3"/> Edit
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {products.length === 0 && <p className="text-center text-muted-foreground py-8">No products found.</p>}
            </CardContent>
        </Card>
    );
}

function AnnouncementCard({ loading, initialText }: { loading: boolean, initialText: string | null }) {
    const [announcementText, setAnnouncementText] = useState(initialText || '');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setAnnouncementText(initialText || '');
    }, [initialText]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateAnnouncement(announcementText);
            toast({
                title: "Success",
                description: "Announcement has been updated.",
            });
        } catch (error) {
            console.error("Failed to update announcement:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not save the announcement.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Announcement</CardTitle>
                </CardHeader>
                <CardContent>
                     <Skeleton className="h-24 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Header Announcement</CardTitle>
                <CardDescription>This text will scroll in the header of the customer site. Leave it blank to hide the announcement bar.</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea
                    placeholder="E.g. Free shipping on all orders over ₹500!"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    rows={3}
                />
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <LoadingLogo className="mr-2 h-4 w-4" />}
                    Save Announcement
                </Button>
            </CardFooter>
        </Card>
    );
}

function FestivalThemeCard({ loading, initialTheme }: { loading: boolean, initialTheme: string | null }) {
    const [selectedTheme, setSelectedTheme] = useState(initialTheme || 'none');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setSelectedTheme(initialTheme || 'none');
    }, [initialTheme]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateFestivalTheme(selectedTheme);
            toast({
                title: "Theme Updated",
                description: `The festival theme has been set to "${festivalThemes.find(t => t.id === selectedTheme)?.name || 'Off'}".`,
            });
        } catch (error) {
            console.error("Failed to update festival theme:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not save the festival theme.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Festival Theme</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <div className="flex items-center gap-2">
                        <PartyPopper />
                        <span>Festival Add-ons</span>
                    </div>
                </CardTitle>
                <CardDescription>Select a festival to apply special visual effects to the customer-facing site.</CardDescription>
            </CardHeader>
            <CardContent>
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                        {festivalThemes.map(theme => (
                            <SelectItem key={theme.id} value={theme.id}>
                                {theme.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <LoadingLogo className="mr-2 h-4 w-4" />}
                    Save Theme
                </Button>
            </CardFooter>
        </Card>
    );
}


export default function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [festivalTheme, setFestivalTheme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If auth is done loading and the user is NOT an admin, redirect them.
    if (!authLoading && !isAdmin) {
      router.push('/login');
    }
  }, [user, isAdmin, authLoading, router]);

  const fetchData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }
    try {
        const [statsData, ordersData, productsData, announcementData, festivalThemeData] = await Promise.all([
            getDashboardStats(),
            getRecentOrders(), // Fetch all orders
            getProducts(),
            getAnnouncement(),
            getFestivalTheme()
        ]);
        setStats(statsData);
        setRecentOrders(ordersData);
        setProducts(productsData);
        setAnnouncement(announcementData);
        setFestivalTheme(festivalThemeData);
    } catch (error) {
        console.error("Failed to fetch admin data:", error);
    } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
        fetchData(true); // Initial fetch with loading state

        const intervalId = setInterval(() => {
            fetchData(false); // Subsequent fetches without loading state
        }, 30 * 60 * 1000); // 30 minutes

        return () => clearInterval(intervalId); // Cleanup on unmount
    }
  }, [isAdmin, fetchData]);
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  }

  // Show a loading state while auth is being checked, or if the user is not an admin yet.
  if (authLoading || !isAdmin) {
    return (
        <div className="flex items-center justify-center h-screen">
            <p>Verifying admin access...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/admin/add-product">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
         <StatCard
            title="Total Revenue"
            value={`₹${stats?.totalSales.toFixed(2) || '0.00'}`}
            description={`${stats?.salesThisMonth || 0} sales this month`}
            icon={<IndianRupee className="h-4 w-4 text-muted-foreground" />}
            loading={loading}
        />
        <StatCard
            title="Orders"
            value={stats?.totalOrders || 0}
            description={`${stats?.pendingOrders || 0} pending`}
            icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
            loading={loading}
        />
        <StatCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            description={`${stats?.outOfStockProducts || 0} out of stock`}
            icon={<Package className="h-4 w-4 text-muted-foreground" />}
            loading={loading}
        />
      </div>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <AnnouncementCard loading={loading} initialText={announcement} />
            <FestivalThemeCard loading={loading} initialTheme={festivalTheme} />
          </div>
          <RecentOrders orders={recentOrders} loading={loading} />
      </div>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AllProducts products={products} loading={loading} />
      </div>
    </div>
  );
}
