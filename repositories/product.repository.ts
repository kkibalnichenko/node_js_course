import { v4 as uuidv4 } from 'uuid';
import { HydratedDocument } from 'mongoose';

import { Product, ProductResponse, ProductsResponse } from '../interfaces/product.interface';
import { ProductMongoose } from '../models/product.model';

export const create = async ({ title, description, price }: Omit<Product, 'id'>): Promise<ProductResponse> => {
    try {
        const product: HydratedDocument<Product> = new ProductMongoose({
            id: uuidv4(),
            title,
            description,
            price,
        });
        const createdProduct = await product.save();

        return {
            data: {
                id: createdProduct.id,
                title: createdProduct.title,
                description: createdProduct.description,
                price: createdProduct.price,
            },
            error: null
        };
    } catch (err: any) {
        return err;
    }
}

export const getAll = async (): Promise<ProductsResponse> => {
    try {
        let products = await ProductMongoose.find() || [];
        if (!products.length) {
            // creating two mock Products if there are no one available
            await create({ title: 'Product 1', description: 'Desc of new product 1', price: 99.50 });
            await create({ title: 'Product 2', description: 'Desc of new product 2', price: 87.90 });
            products = await ProductMongoose.find();
        }
        const formattedProducts: Product[] = products.map(product => ({
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price
        }));
        return { data: formattedProducts, error: null };
    } catch (err: any) {
        return err;
    }
}

export const getProductById = async (productId: string): Promise<HydratedDocument<Product>> => {
    if (!productId) {
        throw new Error('Product id has not been specified');
    }

    return ProductMongoose
        .findOne({ id: productId })
        .select('id title description price');
}

export const getById = async (productId: string): Promise<ProductResponse> => {
    try {
        const product = await getProductById(productId);
        const formattedProduct: Product = {
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price
        };

        return { data: formattedProduct, error: null };
    } catch (err: any) {
        return err;
    }
}