import React, { useEffect, useState } from 'react';
import api from '../api';
import type { Product } from '../types';
import { ShoppingCart, Plus, Minus, X, CreditCard, Banknote, Landmark } from 'lucide-react';

interface CartItem extends Product {
    cartQuantity: number;
}

export default function POSPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash'); // Cash, Card, Transfer

    useEffect(() => {
        api.get('/products').then(res => setProducts(res.data));
    }, []);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, cartQuantity: item.cartQuantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, cartQuantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.cartQuantity + delta);
                return { ...item, cartQuantity: newQty };
            }
            return item;
        }));
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        const saleData = {
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.cartQuantity
            })),
            payment_method: paymentMethod
        };

        try {
            await api.post('/sales', saleData);
            alert('Sale completed successfully!');
            setCart([]);
            // Refresh products to update stock
            api.get('/products').then(res => setProducts(res.data));
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Checkout failed');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.includes(searchTerm)
    );

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6">
            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto">
                <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full p-4 mb-4 border rounded-lg shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <div className="grid grid-cols-3 gap-4">
                    {filteredProducts.map(product => (
                        <div key={product.id}
                            onClick={() => addToCart(product)}
                            className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition border border-gray-100"
                        >
                            <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                            <p className="text-sm text-gray-500">{product.category}</p>
                            <div className="mt-2 flex justify-between items-center">
                                <span className="text-blue-600 font-bold">${product.price}</span>
                                <span className={`text-xs px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    Stock: {product.stock}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart */}
            <div className="w-96 bg-white rounded-lg shadow-lg flex flex-col h-full">
                <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                    <h2 className="text-xl font-bold flex items-center">
                        <ShoppingCart className="mr-2" /> Current Sale
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <p className="text-gray-400 text-center mt-10">Cart is empty</p>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <h4 className="font-medium">{item.name}</h4>
                                    <div className="text-sm text-gray-500">${item.price} x {item.cartQuantity}</div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-100 rounded">
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center">{item.cartQuantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-100 rounded">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 ml-2">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-lg">

                    {/* Payment Method Selector */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setPaymentMethod('Cash')}
                                className={`flex flex-col items-center justify-center p-2 rounded border ${paymentMethod === 'Cash' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <Banknote className="w-5 h-5 mb-1" />
                                <span className="text-xs font-semibold">Cash</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('Card')}
                                className={`flex flex-col items-center justify-center p-2 rounded border ${paymentMethod === 'Card' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <CreditCard className="w-5 h-5 mb-1" />
                                <span className="text-xs font-semibold">Card</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('Transfer')}
                                className={`flex flex-col items-center justify-center p-2 rounded border ${paymentMethod === 'Transfer' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <Landmark className="w-5 h-5 mb-1" />
                                <span className="text-xs font-semibold">Transfer</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between text-xl font-bold mb-4">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                        Complete Sale
                    </button>
                </div>
            </div>
        </div>
    );
}
