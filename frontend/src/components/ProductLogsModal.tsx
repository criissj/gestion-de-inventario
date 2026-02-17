import React, { useEffect, useState } from 'react';
import api from '../api';
import type { ProductLog } from '../types';
import { X, History, Plus, Trash2, ShoppingCart, Edit } from 'lucide-react';
import { sileo } from 'sileo';

interface Props {
    productId: number;
    productName: string;
    onClose: () => void;
}

const ACTION_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    CREATE: { label: 'Creado', className: 'log-badge--create', icon: Plus },
    DELETE: { label: 'Eliminado', className: 'log-badge--delete', icon: Trash2 },
    SALE: { label: 'Venta', className: 'log-badge--sale', icon: ShoppingCart },
    UPDATE: { label: 'Editado', className: 'log-badge--update', icon: Edit },
};

export default function ProductLogsModal({ productId, productName, onClose }: Props) {
    const [logs, setLogs] = useState<ProductLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/products/${productId}/logs`)
            .then(res => setLogs(res.data))
            .catch(err => {
                console.error(err);
                sileo.error({
                    title: 'Error de carga',
                    description: 'No se pudo obtener el historial de este producto.'
                });
            })
            .finally(() => setLoading(false));
    }, [productId]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal modal--wide">
                <div className="modal__header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'var(--accent-light)', color: 'var(--accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <History className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="modal__title">Historial</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>
                                {productName}
                            </p>
                        </div>
                    </div>
                    <button className="modal__close" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="logs-body">
                    {loading ? (
                        <div className="empty-state">
                            <p className="empty-state__sub">Cargando historial...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="empty-state">
                            <History className="empty-state__icon" />
                            <p className="empty-state__title">Sin registros</p>
                            <p className="empty-state__sub">No hay actividad registrada para este producto.</p>
                        </div>
                    ) : (
                        <div className="log-timeline">
                            {logs.map((log, idx) => {
                                const config = ACTION_CONFIG[log.action] || {
                                    label: log.action,
                                    className: 'log-badge--update',
                                    icon: Edit
                                };
                                const IconComp = config.icon;
                                return (
                                    <div key={log.id} className="log-entry">
                                        <div className="log-entry__line">
                                            <div className={`log-entry__dot ${config.className}`}>
                                                <IconComp className="w-3 h-3" />
                                            </div>
                                            {idx < logs.length - 1 && <div className="log-entry__connector" />}
                                        </div>
                                        <div className="log-entry__content">
                                            <div className="log-entry__header">
                                                <span className={`log-badge ${config.className}`}>
                                                    {config.label}
                                                </span>
                                                <span className="log-entry__time">
                                                    {new Date(log.timestamp).toLocaleString('es-CL', {
                                                        day: '2-digit', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            {log.details && (
                                                <p className="log-entry__details">{log.details}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}