import React, { useEffect, useState } from 'react';
import api from '../api';
import type { Product } from '../types';
import { Plus, Edit, Trash2, History } from 'lucide-react';
import ProductLogsModal from '../components/ProductLogsModal';

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [logProduct, setLogProduct] = useState<Product | null>(null); // For history modal
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
        name: '',
        category: '',
        sku: '',
        cost: 0,
        price: 0,
        stock: 0
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to deactivate this product?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentProduct.id) {
                await api.put(`/products/${currentProduct.id}`, currentProduct);
            } else {
                await api.post('/products', currentProduct);
            }
            setIsModalOpen(false);
            setCurrentProduct({ name: '', category: '', sku: '', cost: 0, price: 0, stock: 0 });
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const openEditModal = (product: Product) => {
        setCurrentProduct(product);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setCurrentProduct({ name: '', category: '', sku: '', cost: 0, price: 0, stock: 0 });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
                <button
                    onClick={openAddModal}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.cost}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center">
                                    <button onClick={() => setLogProduct(product)} className="text-blue-600 hover:text-blue-900 mr-4" title="View History">
                                        <History className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => openEditModal(product)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">{currentProduct.id ? 'Edit Product' : 'Add New Product'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    value={currentProduct.name}
                                    onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    value={currentProduct.category}
                                    onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">SKU</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    value={currentProduct.sku || ''}
                                    onChange={e => setCurrentProduct({ ...currentProduct, sku: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cost</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        value={currentProduct.cost}
                                        onChange={e => setCurrentProduct({ ...currentProduct, cost: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        value={currentProduct.price}
                                        onChange={e => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Stock</label>
                                <input
                                    type="number"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    value={currentProduct.stock}
                                    onChange={e => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {logProduct && (
                <ProductLogsModal
                    productId={logProduct.id}
                    productName={logProduct.name}
                    onClose={() => setLogProduct(null)}
                />
            )}
        </div>
    );
}
