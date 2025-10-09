

export type Product = {
  id: string;
  title: string;
  description: string;
  images: string[];
  mrp_price?: number;
  meesho_price: number;
  final_price: number;
  discount_percentage?: number;
  category: string;
  featured: boolean;
  stock: boolean;
  sizes: string[];
  createdAt?: Date;
};

export type Category = {
  id:string;
  name: string;
  isApparel?: boolean;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
};

export type ProductFormData = {
  title: string;
  description: string;
  mrp_price?: number;
  meesho_price: number;
  category: string;
  images: string;
  stock: boolean;
  featured: boolean;
  sizes?: string[];
};

export type ShippingDetails = {
    name: string;
    phoneNumber: string;
    email: string;
    houseNumber: string;
    buildingName: string;
    street: string;
    pincode: string;
    city: string;
    state: string;
    landmark?: string;
};

export type ProductOrderItem = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    size: string;
}

export type Order = {
    id: string;
    userId: string;
    products: ProductOrderItem[];
    total: number;
    shippingAddress: ShippingDetails;
    status: 'pending' | 'placed' | 'shipped' | 'delivered' | 'cancelled' | 'failed';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'verification-failed';
    createdAt: Date;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    error_message?: string;
};

// Types for AI Recommendations
export interface AiCartItem {
  productId: string;
  name: string;
  category: string;
  description: string;
}

export interface CartItemRecommendationsInput {
  cartItems: AiCartItem[];
  maxRecommendations?: number;
}

export interface RecommendedProduct {
  productId: string;
  name: string;
  description: string;
}

export interface CartItemRecommendationsOutput {
  recommendations: RecommendedProduct[];
}
