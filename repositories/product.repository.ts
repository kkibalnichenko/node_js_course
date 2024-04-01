import { default as mockProducts } from '../mocks/products.json';
import { Product, ProductResponse, ProductsResponse } from '../interfaces/product.interface';

export const getAll = (): Promise<ProductsResponse> => {
    return new Promise((resolve, reject) => {
        const products: Product[] = mockProducts || [];
        resolve({ data: products, error: null });
    })
}

export const getById = (productId: string): Promise<ProductResponse> => {
    return new Promise((resolve, reject) => {
        const products: Product[] = mockProducts || [];
        let product: Product | undefined;
        if (products.length) {
            product = products.find((item: Product) => item.id === productId);
        }

        if (product) {
            resolve({ data: product, error: null });
        }
    })
}