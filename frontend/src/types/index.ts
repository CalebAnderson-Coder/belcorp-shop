export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    category: string;
    stock: number;
    sku?: string;
}

export interface CartItem {
    product_id: string;
    quantity: number;
    price: number;
}

export interface Cart {
    items: CartItem[];
    total: number;
}

export interface OrderCreate {
    customer_name: string;
    customer_phone: string;
    customer_address?: string;
    items: CartItem[];
    notes?: string;
}

export interface Order extends OrderCreate {
    id: string;
    created_at: string;
    total: number;
    status: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface User {
    username: string;
    token: string;
}
