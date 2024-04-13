import { Schema, Model, model } from 'mongoose';

import { Product } from '../interfaces/product.interface';

export type ProductModel = Model<Product>;
export const ProductSchema = new Schema<Product, ProductModel>({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
});

export const ProductMongoose: ProductModel = model<Product, ProductModel>('ProductMongoose', ProductSchema);