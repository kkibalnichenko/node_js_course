import { Product, ProductResponse, ProductsResponse } from '../interfaces/product.interface';
import { AppDataSource } from '../data-source';
import { ProductEntity } from '../entity/product.entity';

export const create = async ({ title, description, price }: Omit<Product, 'id'>): Promise<ProductResponse> => {
    try {
        const product = new ProductEntity();
        product.title = title;
        product.description = description;
        product.price = price;

        const createdProduct = await AppDataSource.getRepository(ProductEntity).save(product);

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
        let products = await AppDataSource.getRepository(ProductEntity).find() || [];
        if (!products.length) {
            // creating two mock Products if there are no one available
            await create({ title: 'Product 1', description: 'Desc of new product 1', price: 99.50 });
            await create({ title: 'Product 2', description: 'Desc of new product 2', price: 87.90 });
            products = await AppDataSource.getRepository(ProductEntity).find();
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

export const getProductById = async (productId: string): Promise<ProductEntity | null> => {
    if (!productId) {
        throw new Error('Product id has not been specified');
    }

    return await AppDataSource.getRepository(ProductEntity)
        .findOne({ where: { id: productId } });
}

export const getById = async (productId: string): Promise<ProductResponse> => {
    try {
        const product = await getProductById(productId) || {} as Product;
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