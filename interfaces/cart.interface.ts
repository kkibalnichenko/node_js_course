import { Product } from './product.interface';

export interface CartItem {
    product: Product;
    count: number;
}

export interface Cart {
    id: string;
    userId: string;
    isDeleted: boolean;
    items: CartItem[];
}

export interface CartResponse {
    data: {
        cart: Cart;
        total: number;
    };
    error: null;
}

export interface UpdateCartRequestBody {
    productId: string;
    count: number;
}

export interface EmptySuccessResponse {
    data: {
        success: boolean
    },
    error: null
}