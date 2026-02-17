import React, { useEffect, useState } from 'react';
import api from '../api';
import type { Product } from '../types';
import {
    ShoppingCart, Plus, Minus, X, Banknote, Landmark,
    Search, Package
} from 'lucide-react';
import { sileo } from 'sileo';

interface CartItem extends Product {
    cartQuantity: number;
}

// ─── Pagina principal ────────────────────────────────────────────────────────────────
export default function POSPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [checkingOut, setCheckingOut] = useState(false);

    useEffect(() => {
        api.get('/products').then(res => setProducts(res.data));
    }, []);

    const addToCart = (product: Product) => {
        if (product.stock === 0) {
            sileo.error({ title: 'Sin stock', description: `${product.name} no tiene unidades disponibles.` });
            return;
        }
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.cartQuantity >= product.stock) {
                    sileo.info({ title: 'Límite alcanzado', description: `Solo hay ${product.stock} unidades disponibles.` });
                    return prev;
                }
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
                const newQty = item.cartQuantity + delta;
                if (newQty < 1) return item;
                if (newQty > item.stock) {
                    sileo.info({ title: 'Límite de stock', description: `Máximo ${item.stock} unidades.` });
                    return item;
                }
                return { ...item, cartQuantity: newQty };
            }
            return item;
        }));
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

    const handleCheckout = async () => {
        if (cart.length === 0 || checkingOut) return;
        setCheckingOut(true);
        try {
            await api.post('/sales', {
                items: cart.map(item => ({ product_id: item.id, quantity: item.cartQuantity })),
                payment_method: paymentMethod,
            });
            sileo.success({ title: '¡Venta completada!', description: `Total: $${total.toLocaleString('es-CL')} — ${paymentMethod === 'Cash' ? 'Efectivo' : 'Transferencia'}` });
            setCart([]);
            api.get('/products').then(res => setProducts(res.data));
        } catch (error: any) {
            const msg = error.response?.data?.error || 'No se pudo completar la venta.';
            sileo.error({ title: 'Error en venta', description: msg });
        } finally {
            setCheckingOut(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paymentOptions = [
        { id: 'Cash', label: 'Efectivo', icon: Banknote },
        { id: 'Transfer', label: 'Transferencia', icon: Landmark },
    ];

    return (
        <div className="pos-layout">
            {/* ── Product Grid ── */}
            <div className="pos-products">
                <div className="pos-search-wrapper">
                    <Search className="pos-search__icon" />
                    <input
                        type="text"
                        placeholder="Buscar producto o SKU..."
                        className="pos-search"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="empty-state">
                        <Package className="empty-state__icon" />
                        <p className="empty-state__title">Sin resultados</p>
                        <p className="empty-state__sub">Intenta con otro término de búsqueda.</p>
                    </div>
                ) : (
                    <div className="product-grid">
                        {filteredProducts.map(product => {
                            const inCart = cart.find(i => i.id === product.id);
                            const outOfStock = product.stock === 0;
                            return (
                                <div
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className={`product-card ${outOfStock ? 'product-card--disabled' : ''} ${inCart ? 'product-card--in-cart' : ''}`}
                                >
                                    {inCart && (
                                        <span className="product-card__qty-badge">{inCart.cartQuantity}</span>
                                    )}
                                    <p className="product-card__category">{product.category}</p>
                                    <h3 className="product-card__name">{product.name}</h3>
                                    {product.sku && (
                                        <p className="product-card__sku">{product.sku}</p>
                                    )}
                                    <div className="product-card__footer">
                                        {/* Formato Chileno */}
                                        <span className="product-card__price">${product.price.toLocaleString('es-CL')}</span>
                                        <span className={`badge ${outOfStock ? 'badge--danger' : product.stock < 10 ? 'badge--warning' : 'badge--success'}`}>
                                            {outOfStock ? 'Sin stock' : `${product.stock} uds.`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Cart ── */}
            <aside className="pos-cart">
                <div className="pos-cart__header">
                    <div className="pos-cart__title">
                        <ShoppingCart className="w-4 h-4" />
                        <span>Carrito</span>
                    </div>
                    {cart.length > 0 && (
                        <button
                            className="pos-cart__clear"
                            onClick={() => setCart([])}
                        >
                            Vaciar
                        </button>
                    )}
                </div>

                <div className="pos-cart__items">
                    {cart.length === 0 ? (
                        <div className="pos-cart__empty">
                            <ShoppingCart className="pos-cart__empty-icon" />
                            <p>El carrito está vacío</p>
                            <span>Selecciona productos del panel izquierdo</span>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item__info">
                                    <p className="cart-item__name">{item.name}</p>
                                    {/* Formato Chileno */}
                                    <p className="cart-item__price">${item.price.toLocaleString('es-CL')} c/u</p>
                                </div>
                                <div className="cart-item__controls">
                                    <button
                                        className="qty-btn"
                                        onClick={() => updateQuantity(item.id, -1)}
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="qty-value">{item.cartQuantity}</span>
                                    <button
                                        className="qty-btn"
                                        onClick={() => updateQuantity(item.id, 1)}
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="cart-item__subtotal">
                                    {/* Formato Chileno */}
                                    ${(item.price * item.cartQuantity).toLocaleString('es-CL')}
                                </div>
                                <button
                                    className="cart-item__remove"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="pos-cart__footer">
                    {/* Payment Method */}
                    <div className="payment-section">
                        <p className="payment-label">Método de pago</p>
                        <div className="payment-options">
                            {paymentOptions.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setPaymentMethod(id)}
                                    className={`payment-btn ${paymentMethod === id ? 'payment-btn--active' : ''}`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="pos-total">
                        <span>Total</span>
                        {/* Formato Chileno */}
                        <span className="pos-total__amount">${total.toLocaleString('es-CL')}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || checkingOut}
                        className="btn btn--primary btn--full"
                    >
                        {checkingOut ? 'Procesando...' : 'Completar venta'}
                    </button>
                </div>
            </aside>
        </div>
    );
}