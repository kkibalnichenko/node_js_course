import { Schema, Model, model } from 'mongoose';

import { CartItem } from '../interfaces/cart.interface';

export type CartItemModel = Model<CartItem>;

const CartItemSchema = new Schema<CartItem, CartItemModel>({
    product: { type: Schema.Types.ObjectId, ref: 'ProductMongoose', required: true },
    count: { type: Number, required: true },
});
export const CartItemMongoose: CartItemModel = model<CartItem, CartItemModel>('CartItemMongoose', CartItemSchema);