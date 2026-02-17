import React, { useEffect, useState } from 'react';
import api from '../api';
import type { Product } from '../types';
import { Plus, Edit, Trash2, History, X, Package, AlertTriangle } from 'lucide-react';
import ProductLogsModal from '../components/ProductLogsModal';
import { sileo } from 'sileo';

// ─── Dialogo de confirmacion ───────────────────────────────────────────────────────────
function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <div className="dialog__icon">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="dialog__title">{title}</h3>
        <p className="dialog__description">{description}</p>
        <div className="dialog__actions">
          <button className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn btn--danger" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Pagina principal ────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logProduct, setLogProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: '', category: '', sku: '', cost: 0, price: 0, stock: 0,
  });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch {
      sileo.error({ title: 'Error de conexión', description: 'No se pudieron cargar los productos.' });
    }
  };

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    try {
      await api.delete(`/products/${deleteTarget}`);
      fetchProducts();
      sileo.success({ title: 'Producto eliminado', description: 'El producto fue desactivado correctamente.' });
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo eliminar el producto.' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentProduct.id) {
        await api.put(`/products/${currentProduct.id}`, currentProduct);
        sileo.success({ title: 'Producto actualizado', description: 'Los cambios fueron guardados.' });
      } else {
        await api.post('/products', currentProduct);
        sileo.success({ title: 'Producto creado', description: 'El nuevo producto fue agregado al inventario.' });
      }
      setIsModalOpen(false);
      setCurrentProduct({ name: '', category: '', sku: '', cost: 0, price: 0, stock: 0 });
      fetchProducts();
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo guardar el producto. Intenta nuevamente.' });
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

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <span className="badge badge--danger">Sin stock</span>;
    if (stock < 10) return <span className="badge badge--warning">{stock} unid.</span>;
    return <span className="badge badge--success">{stock} unid.</span>;
  };

  // 👇 1. Lógica para calcular la ganancia al vuelo en el formulario
  const calculateMargin = (cost: number, price: number) => {
    if (!price || !cost) return { profit: 0, percentage: 0 };
    const profit = price - cost;
    const percentage = (profit / cost) * 100;
    return { profit, percentage };
  };

  const currentMargin = calculateMargin(Number(currentProduct.cost), Number(currentProduct.price));

  // 👇 2. Función inteligente para actualizar el costo y sugerir precio
  const handleCostChange = (newCost: number) => {
    const oldCost = currentProduct.cost || 0;
    const currentPrice = currentProduct.price || 0;

    // Detectamos si el usuario confía en el cálculo automático
    // (Es automático si el precio es 0, o si el precio actual es exactamente el doble del costo anterior)
    const isAutoCalculating = currentPrice === 0 || currentPrice === oldCost * 2;

    if (isAutoCalculating) {
      setCurrentProduct({ ...currentProduct, cost: newCost, price: newCost * 2 });
    } else {
      setCurrentProduct({ ...currentProduct, cost: newCost });
    }
  };

  return (
    <>
      <ConfirmDialog
        open={deleteTarget !== null}
        title="¿Eliminar producto?"
        description="Esta acción desactivará el producto del inventario. No podrás deshacerlo fácilmente."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="page-header">
        <div>
          <h2 className="page-title">Inventario</h2>
          <p className="page-subtitle">{products.length} productos registrados</p>
        </div>
        <button className="btn btn--primary" onClick={openAddModal}>
          <Plus className="w-4 h-4" />
          Agregar producto
        </button>
      </div>

      <div className="card">
        {products.length === 0 ? (
          <div className="empty-state">
            <Package className="empty-state__icon" />
            <p className="empty-state__title">Sin productos</p>
            <p className="empty-state__sub">Agrega tu primer producto al inventario.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>SKU</th>
                  <th>Costo</th>
                  <th>Precio</th>
                  <th>Margen</th> {/* Nueva columna */}
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  // Calcular margen para la tabla
                  const margin = calculateMargin(product.cost, product.price);
                  return (
                    <tr key={product.id} className="table__row">
                      <td className="table__name">{product.name}</td>
                      <td>
                        <span className="category-tag">{product.category}</span>
                      </td>
                      <td className="table__mono">{product.sku || '—'}</td>
                      <td className="table__num">${product.cost.toLocaleString('es-CL')}</td>
                      <td className="table__num">${product.price.toLocaleString('es-CL')}</td>
                      <td className="table__num" style={{ color: margin.profit > 0 ? 'var(--green)' : 'var(--red)' }}>
                        {margin.percentage.toFixed(0)}%
                      </td>
                      <td>{getStockBadge(product.stock)}</td>
                      <td>
                        <div className="table__actions">
                          <button
                            className="icon-btn icon-btn--blue"
                            onClick={() => setLogProduct(product)}
                            title="Ver historial"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            className="icon-btn icon-btn--indigo"
                            onClick={() => openEditModal(product)}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="icon-btn icon-btn--red"
                            onClick={() => setDeleteTarget(product.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">
                {currentProduct.id ? 'Editar producto' : 'Nuevo producto'}
              </h3>
              <button className="modal__close" onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal__form">
              <div className="form-grid">
                <div className="form-field form-field--full">
                  <label className="form-label">Nombre del producto</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ej: Lapiz pasta azul"
                    value={currentProduct.name}
                    onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Categoría</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ej: Lápices"
                    value={currentProduct.category}
                    onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">SKU <span className="form-optional">(opcional)</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: AAAAAA"
                    value={currentProduct.sku || ''}
                    onChange={e => setCurrentProduct({ ...currentProduct, sku: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Costo</label>
                  <div className="input-prefix-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      required
                      step="0.01"
                      className="form-input form-input--prefixed"
                      value={currentProduct.cost || ''}
                      onChange={e => handleCostChange(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Precio de venta</label>
                  <div className="input-prefix-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      required
                      step="0.01"
                      className="form-input form-input--prefixed"
                      value={currentProduct.price || ''}
                      onChange={e => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* 👇 3. Bloque visual de ganancia en el formulario 👇 */}
                <div className="form-field form-field--full">
                  {currentMargin.profit > 0 ? (
                    <div style={{ padding: '10px 12px', background: 'var(--green-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 500 }}>Ganancia por unidad:</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--green)', fontWeight: 700 }}>
                        +${currentMargin.profit.toLocaleString('es-CL')} ({currentMargin.percentage.toFixed(0)}%)
                      </span>
                    </div>
                  ) : (currentProduct.price && currentProduct.cost) ? (
                    <div style={{ padding: '10px 12px', background: 'var(--red-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 500 }}>Advertencia: Estás perdiendo dinero</span>
                    </div>
                  ) : null}
                </div>

                <div className="form-field form-field--full">
                  <label className="form-label">Stock inicial</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    placeholder="0"
                    value={currentProduct.stock === 0 ? '' : currentProduct.stock} // Permite borrar el 0 facilmente
                    onChange={e => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary">
                  {currentProduct.id ? 'Guardar cambios' : 'Crear producto'}
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
    </>
  );
}