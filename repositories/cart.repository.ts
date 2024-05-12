import { CartItem, CartResponse, EmptySuccessResponse, UpdateCartRequestBody } from '../interfaces/cart.interface';
import { getProductById } from './product.repository';
import { CheckoutResponse } from '../interfaces/order.interface';
import { AppDataSource } from '../data-source';
import { CartEntity } from '../entity/cart.entity';
import { UserEntity } from '../entity/user.entity';
import { CartItemEntity } from '../entity/cart-item.entity';
import { ProductEntity } from '../entity/product.entity';
import { DeliveryEntity, OrderEntity, PaymentEntity } from '../entity/order.entity';

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
            let updatedItems: CartItem[] = [];
            if (user.cart) {
                if (user.cart?.isDeleted) {
                    user.cart.isDeleted = false;
                    await AppDataSource.getRepository(CartEntity).save(user.cart);
                }
                cart = await AppDataSource.getRepository(CartEntity)
                    .findOne({ where: { id: user?.cart?.id }, relations: { items: true } }) as CartEntity;
                const items = await AppDataSource.getRepository(CartItemEntity)
                    .find( { where: { cart }, relations: { product: true } });
                items.forEach(item => {
                    const elem = {
                        product: {
                            id: item.product.id,
                            title: item.product.title,
                            description: item.product.description,
                            price: item.product.price
                        },
                        count: item.count
                    };
                    updatedItems.push(elem);
                });
            } else {
                cart = await createUserCart(user);
            }

            return {
                data: {
                    cart: { id: cart.id, userId: user.id, isDeleted: cart.isDeleted, items: updatedItems },
                    total: calculateCartTotalPrice(updatedItems)
                },
                error: null,
            };
        }
    } catch (err: any) {
        return err;
    }
}

export const updateCart = async ({ productId, count }: UpdateCartRequestBody, userId: string): Promise<CartResponse | undefined> => {
    if (!userId) {
        throw new Error('Id has not been specified');
    }
    if (!productId) {
        throw new Error('product id has not been specified');
    }

    try {
        const user = await AppDataSource.getRepository(UserEntity)
            .findOne({ where: { id: userId }, relations: { cart: true } }) as UserEntity;
        const cart = await AppDataSource.getRepository(CartEntity)
            .findOne({ where: { id: user?.cart?.id }, relations: { items: true } });

        if (cart) {
            const items = await AppDataSource.getRepository(CartItemEntity)
                .find( { where: { cart }, relations: { product: true } });
            let updatedItems = transformCartItems(items);
            const cartItem = updatedItems.find((item: CartItem) => item?.product?.id === productId);

            if (!cartItem) {
                const product = await getProductById(productId) as ProductEntity;
                const newCartItem = CartItemEntity.create();
                newCartItem.product = product;
                newCartItem.count = count;
                newCartItem.cart = cart;
                const createdCartItem = await newCartItem.save();

                const elem = {
                    product: {
                        id: product.id,
                        title: product.title,
                        description: product.description,
                        price: product.price
                    },
                    count: createdCartItem.count
                };
                updatedItems.push(elem);

                return {
                    data: {
                        cart: { id: cart.id, userId: user.id, isDeleted: cart.isDeleted, items: updatedItems },
                        total: calculateCartTotalPrice(updatedItems)
                    },
                    error: null,
                };
            } else {
                let updatedCount = +cartItem.count + count;
                if (updatedCount <= 0) {
                    updatedCount = 0;
                }
                items.forEach(async (item) => {
                    if (item?.product?.id === productId) {
                        item.count = updatedCount;
                        await item.save();
                    }
                });
                updatedItems = updatedItems.map((item) => {
                    if (item?.product?.id === productId) {
                        item.count = updatedCount;
                    }

                    return item;
                });

                return {
                    data: {
                        cart: { id: cart.id, userId: user.id, isDeleted: cart.isDeleted, items: updatedItems },
                        total: calculateCartTotalPrice(updatedItems)
                    },
                    error: null,
                };
            }
        }
    } catch (err: any) {
        return err;
    }
}

export const deleteCart = async (userId: string): Promise<EmptySuccessResponse | undefined> => {
    if (!userId) {
        throw new Error('Id has not been specified');
    }

    try {
        const user = await AppDataSource.getRepository(UserEntity)
            .findOne({ where: { id: userId }, relations: { cart: true } }) as UserEntity;

        if (user?.cart) {
            user.cart.isDeleted = true;
            await AppDataSource.getRepository(CartEntity).save(user.cart);

            const items = await AppDataSource.getRepository(CartItemEntity)
                .find( { where: { cart: user?.cart }, relations: { product: true } });
            items.forEach(async (item) => {
                await CartItemEntity.delete(item._id);
            });

            return { data: { success: true }, error: null };
        }
    } catch (err: any) {
        return err;
    }
}

export const checkoutCart = async (userId: string): Promise<CheckoutResponse> => {
    try {
        const user = await AppDataSource.getRepository(UserEntity)
            .findOne({ where: { id: userId }, relations: { cart: true } }) as UserEntity;
        const cart = await AppDataSource.getRepository(CartEntity)
            .findOne({ where: { id: user?.cart?.id }, relations: { items: true } }) as CartEntity;
        const items = await AppDataSource.getRepository(CartItemEntity)
            .find( { where: { cart }, relations: { product: true } });
        const updatedItems = transformCartItems(items);

        const payment = PaymentEntity.create();
        payment.type = MOCK_DATA.payment.type;
        payment.address = MOCK_DATA.payment.address;
        payment.creditCard = MOCK_DATA.payment.creditCard;
        const createdPayment = await payment.save();

        const delivery = DeliveryEntity.create();
        delivery.type = MOCK_DATA.delivery.type;
        delivery.address = MOCK_DATA.delivery.address;
        const createdDelivery = await delivery.save();

        const order = OrderEntity.create();
        order.user = user;
        order.cart = cart;
        order.items = items;
        order.payment = createdPayment;
        order.delivery = createdDelivery;
        order.comments = MOCK_DATA.comments;
        order.status = 'created';
        order.total = calculateCartTotalPrice(updatedItems);
        const createdOrder = await order.save();

        user.cart.isDeleted = true;
        await AppDataSource.getRepository(CartEntity).save(user.cart);
        items.forEach(async (item) => {
            await CartItemEntity.delete(item._id);
        });

        return {
            data: {
                order: {
                    id: createdOrder._id,
                    userId: user.id,
                    cartId: cart.id,
                    items: updatedItems,
                    payment: {
                        type: payment.type,
                        address: payment.address,
                        creditCard: payment.creditCard,
                    },
                    delivery: {
                        type: delivery.type,
                        address: delivery.address,
                    },
                    comments: createdOrder.comments,
                    status: createdOrder.status,
                    total: createdOrder.total,
                }
            },
            error: null
        };
    } catch (err: any) {
        return err;
    }
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

const transformCartItems = (items: CartItemEntity[]): CartItem[] => {
    let updatedItems: CartItem[] = [];
    items.forEach(item => {
        const elem = {
            product: {
                id: item.product.id,
                title: item.product.title,
                description: item.product.description,
                price: item.product.price
            },
            count: item.count
        };
        updatedItems.push(elem);
    });

    return updatedItems;
}