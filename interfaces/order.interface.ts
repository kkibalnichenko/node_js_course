import { CartItem } from './cart.interface';

export type ORDER_STATUS = 'created' | 'completed';

export interface Order {
    id: string;
    userId: string;
    cartId: string;
    items: CartItem[];
    payment: {
        type: string;
        address?: any;
        creditCard?: any;
    };
    delivery: {
        type: string;
        address: any;
    };
    comments: string;
    status: ORDER_STATUS;
    total: number;
}

export interface CheckoutResponse {
    data: {
        order: Order;
    };
    error: null;
}