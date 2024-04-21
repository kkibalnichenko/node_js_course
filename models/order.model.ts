import { Schema, Model, model } from 'mongoose';

import { Order } from '../interfaces/order.interface';

export type OrderModel = Model<Order>;

export const OrderSchema = new Schema<Order, OrderModel>({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    cartId: { type: String, required: true },
    // items: [{ type: Schema.Types.ObjectId, ref: 'CartItemMongoose', default: [] }],
    items: [ {product:
            { id: { type: String, required: true },
                title: { type: String, required: true },
                description: { type: String, required: true },
                price: { type: Number, required: true }
            },
        count: { type: Number, required: true }}] || [],
    payment: {
        type: { type: String, required: true },
        address: { type: String },
        creditCard: { type: String },
    },
    delivery: {
        type: { type: String, required: true },
        address: { type: String, required: true },
    },
    comments: { type: String, required: true },
    status: { type: String, enum: ['created', 'completed'], required: true },
    total: { type: Number, required: true },
});

export const OrderMongoose: OrderModel = model<Order, OrderModel>('OrderMongoose', OrderSchema);