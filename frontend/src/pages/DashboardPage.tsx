import React, { useEffect, useState } from 'react';
import api from '../api';
import { DollarSign, TrendingUp, ShoppingBag, AlertTriangle, ArrowUpRight, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

import { sileo } from 'sileo';

// Tooltip mejorado para soportar múltiples variables (Ventas y Ganancias)
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: '#0f1117',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 10,
                padding: '10px 14px',
                color: 'white',
                fontSize: '0.8rem',
                boxShadow: '0 8px 24px rgba(0,0,0,.25)'
            }}>
                <p style={{ color: 'rgba(255,255,255,.5)', marginBottom: 8 }}>{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', marginBottom: 4 }}>
                        <span style={{ color: entry.color }}>{entry.name}:</span>
                        <span style={{ fontWeight: 600 }}>${entry.value?.toLocaleString('es-CL')}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// Colores para el gráfico circular de métodos de pago
const PIE_COLORS = ['#6c7bff', '#10b981', '#f59e0b', '#a855f7'];

export default function DashboardPage() {
    const [stats, setStats] = useState({
        total_sales_today: 0,
        total_profit_today: 0,
        transaction_count: 0,
        low_stock_products: [] as any[],
        top_selling_products: [] as any[],
        payment_methods: [] as any[]
    });
    const [trends, setTrends] = useState([]);

    useEffect(() => {
        api.get('/dashboard')
            .then(res => setStats(res.data))
            .catch(error => {
                console.error('Error cargando estadísticas:', error);
                sileo.error({ title: 'Error de conexión', description: 'No se pudieron cargar las estadísticas generales.' });
            });

        api.get('/sales/trends')
            .then(res => setTrends(res.data))
            .catch(error => {
                console.error('Error cargando tendencias:', error);
                sileo.error({ title: 'Error de conexión', description: 'No se pudo cargar el gráfico de ventas.' });
            });
    }, []);

    const statCards = [
        {
            title: 'Ventas de hoy',
            value: `$${stats.total_sales_today.toLocaleString('es-CL', { minimumFractionDigits: 0 })}`,
            icon: DollarSign,
            color: 'stat-card--green',
        },
        {
            title: 'Ganancia de hoy',
            value: `$${stats.total_profit_today.toLocaleString('es-CL', { minimumFractionDigits: 0 })}`,
            icon: TrendingUp,
            color: 'stat-card--blue',
        },
        {
            title: 'Transacciones',
            value: stats.transaction_count,
            icon: ShoppingBag,
            color: 'stat-card--purple',
        },
    ];

    return (
        <div className="dashboard">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Dashboard General</h2>
                    <p className="page-subtitle">Resumen y métricas de tu negocio</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stat-grid">
                {statCards.map((card, i) => (
                    <div key={i} className={`stat-card ${card.color}`} style={{ animationDelay: `${i * 0.07}s` }}>
                        <div className="stat-card__icon">
                            <card.icon className="w-5 h-5" />
                        </div>
                        <div className="stat-card__body">
                            <p className="stat-card__label">{card.title}</p>
                            <h3 className="stat-card__value">{card.value}</h3>
                        </div>
                        <ArrowUpRight className="stat-card__arrow" />
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                {/* Left Column: Main Chart */}
                <div className="card dashboard-chart">
                    <div className="card-header">
                        <h3 className="card-title">Ingresos vs Ganancias — últimos 7 días</h3>
                    </div>
                    <div className="chart-wrapper" style={{ flex: 1, minHeight: '350px', height: 'auto', padding: '10px 10px 20px 0' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trends} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'DM Sans' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'DM Sans' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={v => `$${v.toLocaleString('es-CL')}`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(108,123,255,.06)', radius: 6 }} />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', fontFamily: 'DM Sans' }} />
                                {/* Barras conectadas a los colores de tu CSS */}
                                <Bar dataKey="total" name="Ingresos" fill="#6c7bff" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="profit" name="Ganancia" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: Side Cards */}
                <div className="dashboard-side">

                    {/* Payment Methods Pie Chart */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <PieChartIcon className="w-4 h-4 text-indigo-500" />
                                Preferencia de Pago
                            </h3>
                        </div>
                        <div className="chart-wrapper" style={{ height: '200px', padding: '10px 0' }}>
                            {stats.payment_methods?.length === 0 ? (
                                <p className="list__empty">Sin pagos registrados todavía.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.payment_methods}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {stats.payment_methods.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontFamily: 'DM Sans' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                Más vendidos
                            </h3>
                        </div>
                        <div className="list">
                            {stats.top_selling_products.length === 0 ? (
                                <p className="list__empty">Sin ventas registradas todavía.</p>
                            ) : (
                                stats.top_selling_products.map((p: any, idx) => (
                                    <div key={idx} className="list__item">
                                        <div className="list__rank">#{idx + 1}</div>
                                        <span className="list__name">{p.name}</span>
                                        <span className="badge badge--success">{p.quantity} uds.</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Low Stock */}
                    <div className="card card--alert">
                        <div className="card-header">
                            <h3 className="card-title">
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                Stock bajo
                            </h3>
                        </div>
                        <div className="list">
                            {stats.low_stock_products.length === 0 ? (
                                <p className="list__empty list__empty--ok">✓ Todo el stock está en niveles saludables.</p>
                            ) : (
                                stats.low_stock_products.map((p: any) => (
                                    <div key={p.id} className="list__item">
                                        <span className="list__name">{p.name}</span>
                                        <span className="badge badge--danger">{p.stock} restantes</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}