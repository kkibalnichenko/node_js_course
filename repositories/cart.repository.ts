import { v4 as uuidv4 } from 'uuid';
import path from 'path';

import { default as mockCarts } from '../mocks/carts.json';
import { Cart, CartItem, CartResponse, EmptySuccessResponse, UpdateCartRequestBody } from '../interfaces/cart.interface';
import { writeToFile } from '../utils';
import { getById } from './product.repository';
import { CheckoutResponse, Order } from '../interfaces/order.interface';

const MOCK_DATA = {
    payment: {
        type: 'paypal',
        address: 'London',
        creditCard: '1234-1234-1234-1234',
    },
    delivery: {
        type: 'post',
        address: 'London',
    },
    comments: '',
};

export const getCart = (userId: string): Promise<CartResponse> => {
    return new Promise((resolve, reject) => {
        let carts: Cart[] = mockCarts || [];
        let cart: Cart | undefined;
        if (carts.length) {
            cart = carts.find((item: Cart) => item.userId === userId);
        }

        if (!cart) {
            cart = createUserCart(userId);
            writeToFile(path.join(__dirname, '../../mocks/carts.json'), [...carts, cart]);
        } else {
            if (cart.isDeleted) {
                cart = {...cart, isDeleted: false, items: []};
                carts = carts.filter((item: Cart) => item.id !== cart?.id);
                writeToFile(path.join(__dirname, '../../mocks/carts.json'), [...carts, cart]);
            }
            resolve({ data: { cart, total: calculateCartTotalPrice(cart.items) }, error: null });
        }
    })
}

export const updateCart = ({ productId, count }: UpdateCartRequestBody, userId: string): Promise<CartResponse> => {
    return new Promise((resolve, reject) => {
        let carts: Cart[] = mockCarts || [];
        let cart: Cart;
        cart = carts.find((item: Cart) => item.userId === userId) as Cart;

        if (cart) {
            const cartItem = cart.items.find((item: CartItem) => item.product.id === productId);
            if (!cartItem) {
                getById(productId)
                    .then((res) => {
                        const newCartItem: CartItem = { product: res.data, count };
                        cart = {...cart, items: [ ...cart?.items, newCartItem ] || [ newCartItem ]};
                        carts = carts.filter((item: Cart) => item.id !== cart.id);
                        writeToFile(path.join(__dirname, '../../mocks/carts.json'), [...carts, cart]);
                        resolve({ data: { cart, total: calculateCartTotalPrice(cart.items) }, error: null });
                    })
                    .catch((err) => reject(err));
            } else {
                const updatedCount = cartItem.count + count;
                if (updatedCount <= 0) {
                    cart.items = cart.items.filter((item) => item !== cartItem);
                } else {
                    cart.items = cart.items.map((item) => {
                        if (item === cartItem) {
                            return {...item, count: updatedCount};
                        }

                        return item;
                    });
                }
                carts = carts.filter((item: Cart) => item.id !== cart.id);
                writeToFile(path.join(__dirname, '../../mocks/carts.json'), [...carts, cart]);
                resolve({ data: { cart, total: calculateCartTotalPrice(cart.items) }, error: null });
            }
        }
    })
}

export const deleteCart = (userId: string): Promise<EmptySuccessResponse> => {
    return new Promise((resolve, reject) => {
        let carts: Cart[] = mockCarts || [];
        if (carts.length) {
            carts = carts.map((item: Cart) => {
                if (item.userId === userId) {
                    return {...item, isDeleted: true}
                }

                return item;
            });
            writeToFile(path.join(__dirname, '../../mocks/carts.json'), carts);
            resolve({ data: { success: true }, error: null });
        }
    })
}

export const checkoutCart = (userId: string): Promise<CheckoutResponse> => {
    return new Promise((resolve, reject) => {
        let carts: Cart[] = mockCarts || [];
        if (carts.length) {
            const cart = carts.find((item: Cart) => item.userId === userId) as Cart;

            carts = carts.map((item: Cart) => {
                if (item.userId === userId) {
                    return {...item, isDeleted: true}
                }

                return item;
            });
            writeToFile(path.join(__dirname, '../../mocks/carts.json'), carts);

            const order: Order = {
                id: uuidv4(),
                userId: cart.userId,
                cartId: cart.id,
                items: cart.items,
                payment: {
                    type: MOCK_DATA.payment.type,
                    address: MOCK_DATA.payment.address,
                    creditCard: MOCK_DATA.payment.creditCard,
                },
                delivery: {
                    type: MOCK_DATA.delivery.type,
                    address: MOCK_DATA.delivery.address,
                },
                comments: MOCK_DATA.comments,
                status: 'created',
                total: calculateCartTotalPrice(cart.items),
            };
            resolve({ data: { order }, error: null });
        }
    })
}

const createUserCart = (userId: string): Cart => {
    const id = uuidv4();
    return {
        id,
        userId,
        isDeleted: false,
        items: [],
    }
}

const calculateCartTotalPrice = (cartItems: CartItem[]): number => {
    if (!cartItems.length) return 0;

    const total = cartItems.reduce((accumulator: number, currentValue: CartItem) =>
        accumulator + currentValue.product.price * currentValue.count, 0,
    );

    return total;
}