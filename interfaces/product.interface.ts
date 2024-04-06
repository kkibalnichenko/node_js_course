export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
}

export interface ProductResponse {
    data: Product;
    error: null;
}

export interface ProductsResponse {
    data: Product[];
    error: null;
}