import { v4 as uuidv4 } from 'uuid';
import { HydratedDocument } from 'mongoose';

import { Cart, CartItem, CartResponse, EmptySuccessResponse, UpdateCartRequestBody } from '../interfaces/cart.interface';
import { getById } from './product.repository';
import { CheckoutResponse, Order } from '../interfaces/order.interface';
import { CartMongoose } from '../models/cart.model';
import { OrderMongoose } from '../models/order.model';
import { AppDataSource } from '../data-source';
import { CartEntity } from '../entity/cart.entity';
import { UserEntity } from '../entity/user.entity';

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

export const getCart = async (userId: string): Promise<CartResponse | undefined> => {
    if (!userId) {
        throw new Error('Id has not been specified');
    }

    try {
        const user = await AppDataSource.getRepository(UserEntity)
            .findOne({ where: { id: userId }, relations: { cart: true } });

        if (user) {
            let cart;
            if (user.cart) {
                cart = user.cart;
                if (user.cart?.isDeleted) {
                    user.cart.isDeleted = false;
                    cart = await AppDataSource.getRepository(CartEntity).save(user.cart);
                }
            } else {
                cart = await createUserCart(user);
            }

            return {
                data: {
                    cart: { id: cart.id, userId: user.id, isDeleted: cart.isDeleted, items: cart.items },
                    total: calculateCartTotalPrice(cart.items || [])
                },
                error: null,
            };
        }
    } catch (err: any) {
        return err;
    }
}

// export const updateCart = async ({ productId, count }: UpdateCartRequestBody, userId: string): Promise<CartResponse> => {
export const updateCart = async ({ productId, count }: UpdateCartRequestBody, userId: string): Promise<any> => {
    if (!userId) {
        throw new Error('Id has not been specified');
    }
    if (!productId) {
        throw new Error('product id has not been specified');
    }

    // const cartRepository = AppDataSource.getRepository(CartEntity);
    // return await cartRepository.findOne({ where: { userId } })
    //     .then(async (cart) => {
    //         // let newCart;
    //         if (cart) {
    //             console.log('updateCart cart', cart);
    //             // const cartObj = cart.toObject();
    //             const cartItem = cart?.items?.find((item: CartItem) => item?.product?.id === productId);
    //             console.log('cartItem', cartItem);
    //             if (!cartItem) {
    //                 return getById(productId)
    //                     .then(async (res) => {
    //                         console.log('producr res', res);
    //                         const newCartItem: CartItem = { product: res.data, count };
    //                         console.log('newCartItem', newCartItem);
    //                         // const data = { ...cart, items: cart?.items ? [ ...cart?.items, newCartItem ] : [ newCartItem ]};
    //                         // cart = { ...cart, items: cart?.items ? [ ...cart?.items, newCartItem ] : [ newCartItem ]};
    //                         // console.log('cart 103', cart);
    //                         // cart.set(data);
    //                         // newCart = await cart.save();
    //                         console.log('&&&', cart?.items ? [ ...cart?.items, newCartItem ] : [ newCartItem ]);
    //                         await cartRepository
    //                             .createQueryBuilder()
    //                             // .update<CartEntity>(CartEntity, {items: cart?.items ? [ ...cart?.items, newCartItem ] : [ newCartItem ]})
    //                             .update<CartEntity>(CartEntity, {items: [ newCartItem ]})
    //                             .where("id = :id", { id: cart.id })
    //                             // .updateEntity(true)
    //                             .execute();
    //                         console.log('cart 112', cart);
    //                         return {
    //                             data: {
    //                                 cart: {
    //                                     id: cart.id,
    //                                     userId: cart.userId,
    //                                     isDeleted: cart.isDeleted,
    //                                     items: cart.items.map(item => ({product: item.product, count: item.count})),
    //                                 },
    //                                 total: calculateCartTotalPrice(cart.items || [])
    //                             },
    //                             error: null,
    //                         };
    //                     })
    //                     .catch((err) => {
    //                         return err;
    //                     });
    //             } else {
    //                 let updatedCount = cartItem?.count + count;
    //                 if (updatedCount <= 0) {
    //                     updatedCount = 0;
    //                 }
    //                 cart.items = cart.items.map((item) => {
    //                     if (item._id === cartItem._id) {
    //                         item.count = updatedCount;
    //                         // return {...item, count: updatedCount};
    //                     }
    //
    //                     return item;
    //                 });
    //                 // cart.set(cartObj);
    //                 // newCart = await cart.save();
    //                 await cartRepository
    //                     .createQueryBuilder()
    //                     .update<CartEntity>(CartEntity, cart)
    //                     .where("id = :id", { id: cart.id })
    //                     // .updateEntity(true)
    //                     .execute();
    //
    //                 return {
    //                     data: {
    //                         cart: {
    //                             id: cart.id,
    //                             userId: cart.userId,
    //                             isDeleted: cart.isDeleted,
    //                             items: cart.items.map(item => ({product: item.product, count: item.count})),
    //                         },
    //                         total: calculateCartTotalPrice(cart.items || [])
    //                     },
    //                     error: null,
    //                 };
    //             }
    //         }
    //     })
    //     .catch((err: any) => {
    //         return err;
    //     });
}

export const deleteCart = async (userId: string): Promise<EmptySuccessResponse | undefined> => {
    if (!userId) {
        throw new Error('Id has not been specified');
    }

    try {
        const user = await AppDataSource.getRepository(UserEntity)
            .findOne({ where: { id: userId }, relations: { cart: true } });

        if (user?.cart) {
            user.cart.isDeleted = true;
            await AppDataSource.getRepository(CartEntity).save(user.cart);

            return { data: { success: true }, error: null };
        }
    } catch (err: any) {
        return err;
    }
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

const createUserCart = async (user: UserEntity): Promise<CartEntity> => {
    const cart = new CartEntity();
    cart.user = user;
    cart.isDeleted = false;
    cart.items = [];

    const createdCart = await AppDataSource.getRepository(CartEntity).save(cart);

    return createdCart;
}

const calculateCartTotalPrice = (cartItems: CartItem[]): number => {
    if (!cartItems.length) return 0;

    const total = cartItems.reduce((accumulator: number, currentValue: CartItem) =>
        accumulator + currentValue.product.price * currentValue.count, 0,
    );

    return total;
}