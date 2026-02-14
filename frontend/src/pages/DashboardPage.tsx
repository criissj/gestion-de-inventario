import React, { useEffect, useState } from 'react';
import api from '../api';
import { DollarSign, TrendingUp, ShoppingBag, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        total_sales_today: 0,
        total_profit_today: 0,
        transaction_count: 0,
        low_stock_products: [],
        top_selling_products: []
    });
    const [trends, setTrends] = useState([]);

    useEffect(() => {
        api.get('/dashboard').then(res => setStats(res.data));
        api.get('/sales/trends').then(res => setTrends(res.data));
    }, []);

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
            <div className={`p-3 rounded-full ${color} text-white`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Today's Revenue"
                    value={`$${stats.total_sales_today.toFixed(2)}`}
                    icon={DollarSign}
                    color="bg-green-500"
                />
                <StatCard
                    title="Today's Profit"
                    value={`$${stats.total_profit_today.toFixed(2)}`}
                    icon={TrendingUp}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Transactions Today"
                    value={stats.transaction_count}
                    icon={ShoppingBag}
                    color="bg-purple-500"
                />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Welcome Back!</h3>
                <p className="text-gray-600">
                    Use the sidebar to manage your inventory or process new sales at the Point of Sale.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Sales Trends (Last 7 Days)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products & Low Stock */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-green-500" /> Top Selling Products
                        </h3>
                        <ul>
                            {stats.top_selling_products.map((p: any, idx) => (
                                <li key={idx} className="flex justify-between py-2 border-b last:border-0">
                                    <span>{p.name}</span>
                                    <span className="font-bold">{p.quantity} sold</span>
                                </li>
                            ))}
                            {stats.top_selling_products.length === 0 && <p className="text-gray-500">No sales yet.</p>}
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-400">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" /> Low Stock Alerts
                        </h3>
                        <ul>
                            {stats.low_stock_products.map((p: any) => (
                                <li key={p.id} className="flex justify-between py-2 border-b last:border-0 text-red-600">
                                    <span>{p.name}</span>
                                    <span className="font-bold">{p.stock} remaining</span>
                                </li>
                            ))}
                            {stats.low_stock_products.length === 0 && <p className="text-green-600">All stocks are healthy.</p>}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
