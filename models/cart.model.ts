import { Schema, Model, model } from 'mongoose';

import { Cart } from '../interfaces/cart.interface';

export type CartModel = Model<Cart>;

export const CartSchema = new Schema<Cart, CartModel>({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    isDeleted: { type: Boolean, required: true },
    // items: [{ type: Schema.Types.ObjectId, ref: 'CartItemMongoose', default: [] }],
    items: [ {product:
                { id: { type: String, required: true },
                  title: { type: String, required: true },
                  description: { type: String, required: true },
                  price: { type: Number, required: true }
                },
            count: { type: Number, required: true }}] || [],
});

export const CartMongoose: CartModel = model<Cart, CartModel>('CartMongoose', CartSchema);