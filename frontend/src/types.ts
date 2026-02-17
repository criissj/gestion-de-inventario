export interface Product {
    id: number;
    name: string;
    category: string;
    sku: string;
    cost: number;
    price: number;
    stock: number;
    is_active?: boolean;
    created_at?: string;
}

// Agregado para el modal de auditoría de productos
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

// Agregado para el historial de ventas
export interface Sale {
    id: number;
    date_time: string;
    total_amount: number;
    total_profit: number;
    payment_method: string;
    items?: any[];
}