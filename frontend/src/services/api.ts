import axios from 'axios';
import { Product, OrderCreate, Order, LoginRequest, LoginResponse } from '../types';

const API_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// API functions
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await api.post<LoginResponse>('/token', formData);
    return response.data;
};

export const getProducts = async (category?: string, page: number = 1): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('page', page.toString());

    const response = await api.get<Product[]>('/products', { params });
    return response.data;
};

export const getProduct = async (productId: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${productId}`);
    return response.data;
};

export const getCategories = async (): Promise<string[]> => {
    const response = await api.get<string[]>('/categories');
    return response.data;
};

export const createOrder = async (order: OrderCreate): Promise<Order> => {
    const response = await api.post<Order>('/orders', order);
    return response.data;
};

export const sendOrder = async (orderData: any) => {
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            throw new Error('Error al procesar la orden');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en sendOrder:', error);
        throw error;
    }
};
