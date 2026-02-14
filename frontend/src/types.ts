export interface Product {
    id: number;
    name: string;
    category: string;
    sku?: string;
    cost: number;
    price: number;
    stock: number;
    is_active: boolean; // [NEW]
}

export interface ProductLog {
    id: number;
    product_id: number;
    action: string;
    details: string;
    timestamp: string;
}

export interface SaleItem {
    product_id: number;
    quantity: number;
    price: number;
    cost: number;
}

export interface Sale {
    id: number;
    date_time: string;
    total_amount: number;
    total_profit: number;
    payment_method: string; // [NEW]
    items?: SaleItem[];
}
