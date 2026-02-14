import React, { useEffect, useState } from 'react';
import api from '../api';
import type { ProductLog } from '../types';
import { X } from 'lucide-react';

interface Props {
    productId: number;
    productName: string;
    onClose: () => void;
}

export default function ProductLogsModal({ productId, productName, onClose }: Props) {
    const [logs, setLogs] = useState<ProductLog[]>([]);

    useEffect(() => {
        api.get(`/products/${productId}/logs`)
            .then(res => setLogs(res.data))
            .catch(err => console.error(err));
    }, [productId]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-bold">History: {productName}</h3>
                    <button onClick={onClose}><X className="w-6 h-6" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Action</th>
                                <th className="px-4 py-2 text-left">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {logs.map(log => (
                                <tr key={log.id}>
                                    <td className="px-4 py-2 text-sm text-gray-500">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold 
                                            ${log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                                                log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                                                    log.action === 'SALE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-sm">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
