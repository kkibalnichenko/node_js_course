import { v4 as uuidv4 } from 'uuid';
import { HydratedDocument } from 'mongoose';

import { Cart, CartItem, CartResponse, EmptySuccessResponse, UpdateCartRequestBody } from '../interfaces/cart.interface';
import { getById } from './product.repository';
import { CheckoutResponse, Order } from '../interfaces/order.interface';
import { CartMongoose } from '../models/cart.model';
import { OrderMongoose } from '../models/order.model';

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
    comments: 'mock comments',
};

export const getCart = async (userId: string): Promise<CartResponse> => {
    if (!userId) {
        throw new Error('Id has not been specified');
    }

    return CartMongoose.findOne({ userId })
        .then(async (cart) => {
            let newCart;
            if (cart) {
                const cartObj = cart.toObject();
                newCart = cart;
                if (cartObj.isDeleted) {
                    cart.set({ ...cartObj, isDeleted: false, items: [] });
                    newCart = await cart.save();
                }
            } else {
                newCart = await createUserCart(userId);
            }
            return {
                data: {
                    cart: { id: newCart.id, userId: newCart.userId, isDeleted: newCart.isDeleted, items: newCart.items },
                    total: calculateCartTotalPrice(newCart.items || [])
                },
                error: null,
            };
        })
        .catch((err: any) => {
            return err;
        });
}

export const updateCart = async ({ productId, count }: UpdateCartRequestBody, userId: string): Promise<CartResponse> => {
    if (!userId) {
        throw new Error('Id has not been specified');
    }
    if (!productId) {
        throw new Error('product id has not been specified');
    }

    return CartMongoose.findOne({ userId })
        .then(async (cart) => {
            let newCart;
            if (cart) {
                const cartObj = cart.toObject();
                const cartItem = cartObj?.items?.find((item: CartItem) => item?.product?.id === productId);
                if (!cartItem) {
                    return getById(productId)
                        .then(async (res) => {
                            const newCartItem: CartItem = { product: res.data, count };
                            const data = { ...cartObj, items: cartObj?.items ? [ ...cartObj?.items, newCartItem ] : [ newCartItem ]};
                            cart.set(data);
                            newCart = await cart.save();

                            return {
                                data: {
                                    cart: {
                                        id: newCart.id,
                                        userId: newCart.userId,
                                        isDeleted: newCart.isDeleted,
                                        items: newCart.items.map(item => ({product: item.product, count: item.count})),
                                    },
                                    total: calculateCartTotalPrice(newCart.items || [])
                                },
                                error: null,
                            };
                        })
                        .catch((err) => {
                            return err;
                        });
                } else {
                    let updatedCount = cartItem?.count + count;
                    if (updatedCount <= 0) {
                        updatedCount = 0;
                    }
                    cartObj.items = cartObj.items.map((item) => {
                        if (item === cartItem) {
                            return {...item, count: updatedCount};
                        }

                        return item;
                    });
                    cart.set(cartObj);
                    newCart = await cart.save();

                    return {
                        data: {
                            cart: {
                                id: newCart.id,
                                userId: newCart.userId,
                                isDeleted: newCart.isDeleted,
                                items: newCart.items.map(item => ({product: item.product, count: item.count})),
                            },
                            total: calculateCartTotalPrice(newCart.items || [])
                        },
                        error: null,
                    };
                }
            }
        })
        .catch((err: any) => {
            return err;
        });
}

export const deleteCart = (userId: string): Promise<EmptySuccessResponse> => {
    if (!userId) {
        throw new Error('Id has not been specified');
    }

    return CartMongoose.findOne({ userId })
        .then(async (cart) => {
            if (cart) {
                const cartObj = cart.toObject();
                cart.set({ ...cartObj, isDeleted: true });
                await cart.save();

                return { data: { success: true }, error: null };
            }
        })
        .catch((err: any) => {
            return err;
        });
}

export const checkoutCart = (userId: string): Promise<CheckoutResponse> => {
    return CartMongoose.findOne({ userId })
        .then(async (cart) => {
            if (cart) {
                const order: HydratedDocument<Order> = new OrderMongoose({
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
                });
                const createdOrder = await order.save();
                cart.set({ ...cart, isDeleted: true });
                await cart.save();

                return {
                    data: {
                        order: {
                            id: createdOrder.id,
                            userId: createdOrder.userId,
                            cartId: createdOrder.cartId,
                            items: createdOrder.items.map(item => ({product: item.product, count: item.count})),
                            payment: {
                                type: createdOrder.payment.type,
                                address: createdOrder.payment.address,
                                creditCard: createdOrder.payment.creditCard,
                            },
                            delivery: {
                                type: createdOrder.delivery.type,
                                address: createdOrder.delivery.address,
                            },
                            comments: createdOrder.comments,
                            status: createdOrder.status,
                            total: createdOrder.total,
                        }
                    },
                    error: null };
            }
        })
        .catch((err: any) => {
            return err;
        });
}

const createUserCart = async (userId: string): Promise<HydratedDocument<Cart>> => {
    const cart: HydratedDocument<Cart> = new CartMongoose({
        id: uuidv4(),
        userId,
        isDeleted: false,
        items: [],
    });
    await cart.save();

    return cart;
}

const calculateCartTotalPrice = (cartItems: CartItem[]): number => {
    if (!cartItems.length) return 0;

    const total = cartItems.reduce((accumulator: number, currentValue: CartItem) =>
        accumulator + currentValue.product.price * currentValue.count, 0,
    );

    return total;
}