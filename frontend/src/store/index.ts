import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Cart, CartItem, Product } from '../types';

interface AuthState {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

interface CartState {
    cart: Cart;
    addToCart: (product: Product, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
}

// Auth Store
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            logout: () => {
                localStorage.removeItem('token');
                set({ user: null });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);

// Cart Store
export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            cart: { items: [], total: 0 },
            addToCart: (product, quantity) =>
                set((state) => {
                    const existingItem = state.cart.items.find(
                        (item) => item.product_id === product.id
                    );

                    let newItems;
                    if (existingItem) {
                        newItems = state.cart.items.map((item) =>
                            item.product_id === product.id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        );
                    } else {
                        newItems = [
                            ...state.cart.items,
                            {
                                product_id: product.id,
                                quantity,
                                price: product.price,
                            },
                        ];
                    }

                    const total = newItems.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                    );

                    return { cart: { items: newItems, total } };
                }),
            removeFromCart: (productId) =>
                set((state) => {
                    const newItems = state.cart.items.filter(
                        (item) => item.product_id !== productId
                    );
                    const total = newItems.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                    );
                    return { cart: { items: newItems, total } };
                }),
            updateQuantity: (productId, quantity) =>
                set((state) => {
                    const newItems = state.cart.items.map((item) =>
                        item.product_id === productId
                            ? { ...item, quantity }
                            : item
                    );
                    const total = newItems.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                    );
                    return { cart: { items: newItems, total } };
                }),
            clearCart: () =>
                set({ cart: { items: [], total: 0 } }),
        }),
        {
            name: 'cart-storage',
        }
    )
);
