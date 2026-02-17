import React, { useEffect, useState } from 'react';
import api from '../api';
import type { Sale } from '../types';
import { Receipt, TrendingUp } from 'lucide-react';
import { sileo } from 'sileo';

export default function SalesHistoryPage() {
    const [sales, setSales] = useState<Sale[]>([]);

    useEffect(() => {
        api.get('/sales')
            .then(res => setSales(res.data))
            .catch(error => {
                console.error('Error al cargar historial de ventas:', error);
                sileo.error({
                    title: 'Error de conexión',
                    description: 'No se pudo cargar el historial de transacciones.'
                });
            });
    }, []);

    const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
    const totalProfit = sales.reduce((sum, s) => sum + s.total_profit, 0);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">Historial de ventas</h2>
                    <p className="page-subtitle">{sales.length} transacciones registradas</p>
                </div>
            </div>

            {/* Summary */}
            {sales.length > 0 && (
                <div className="stat-grid" style={{ marginBottom: 22 }}>
                    <div className="stat-card stat-card--green" style={{ animationDelay: '0s' }}>
                        <div className="stat-card__icon">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div className="stat-card__body">
                            <p className="stat-card__label">Ingresos totales</p>
                            <h3 className="stat-card__value">
                                ${totalRevenue.toLocaleString('es-CL')}
                            </h3>
                        </div>
                    </div>
                    <div className="stat-card stat-card--blue" style={{ animationDelay: '0.07s' }}>
                        <div className="stat-card__icon">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="stat-card__body">
                            <p className="stat-card__label">Ganancia total</p>
                            <h3 className="stat-card__value">
                                ${totalProfit.toLocaleString('es-CL')}
                            </h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                {sales.length === 0 ? (
                    <div className="empty-state">
                        <Receipt className="empty-state__icon" />
                        <p className="empty-state__title">Sin ventas registradas</p>
                        <p className="empty-state__sub">Las ventas completadas aparecerán aquí.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Fecha y hora</th>
                                    <th>Ítems</th>
                                    <th>Método de pago</th>
                                    <th>Total</th>
                                    <th>Ganancia</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map((sale) => (
                                    <tr key={sale.id} className="table__row">
                                        <td className="table__mono" style={{ color: 'var(--text-muted)' }}>
                                            #{String(sale.id).padStart(4, '0')}
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                                            {new Date(sale.date_time).toLocaleString('es-CL', {
                                                day: '2-digit', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td>
                                            <span className="category-tag">
                                                {sale.items?.length || 0} ítem{(sale.items?.length || 0) !== 1 ? 's' : ''}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge badge--info" style={{
                                                background: 'var(--blue-light)',
                                                color: 'var(--blue)'
                                            }}>
                                                {sale.payment_method === 'Cash' ? 'Efectivo'
                                                    : sale.payment_method === 'Transfer' ? 'Transferencia'
                                                        : sale.payment_method === 'Card' ? 'Tarjeta'
                                                            : sale.payment_method}
                                            </span>
                                        </td>
                                        <td className="table__num" style={{ color: 'var(--green)' }}>
                                            ${sale.total_amount.toLocaleString('es-CL')}
                                        </td>
                                        <td className="table__num" style={{ color: 'var(--text-secondary)' }}>
                                            ${sale.total_profit.toLocaleString('es-CL')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}