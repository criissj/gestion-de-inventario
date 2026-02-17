import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, History, Menu, X } from 'lucide-react';

import { Toaster } from 'sileo';
//import 'sileo/dist/styles.css';

import InventoryPage from './pages/InventoryPage';
import POSPage from './pages/POSPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import DashboardPage from './pages/DashboardPage';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pos', icon: ShoppingCart, label: 'Realizar venta' },
  { to: '/inventory', icon: Package, label: 'Inventario' },
  { to: '/history', icon: History, label: 'Historial de ventas' },
];

function NavLink({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/dashboard' && location.pathname === '/');

  return (
    <Link
      to={to}
      className={`nav-link ${isActive ? 'nav-link--active' : ''}`}
    >
      <Icon className="nav-link__icon" />
      <span>{label}</span>
      {isActive && <span className="nav-link__indicator" />}
    </Link>
  );
}

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <div className="sidebar__logo-icon">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="sidebar__logo-title">Inventario</span>
              <span className="sidebar__logo-sub">Sistema de gestión</span>
            </div>
          </div>
          <button className="sidebar__close" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="sidebar__section-label">Menú principal</div>

        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__footer-dot" />
          <span>Sistema activo</span>
        </div>
      </aside>
    </>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <Toaster />

      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className={`app-main ${sidebarOpen ? 'app-main--shifted' : ''}`}>
          <header className="app-header">
            <button
              className="app-header__menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="app-header__breadcrumb">
              <Routes>
                <Route path="/dashboard" element={<span>Dashboard</span>} />
                <Route path="/pos" element={<span>Realizar venta</span>} />
                <Route path="/inventory" element={<span>Inventario</span>} />
                <Route path="/history" element={<span>Historial de ventas</span>} />
                <Route path="/" element={<span>Dashboard</span>} />
              </Routes>
            </div>
          </header>

          <main className="app-content">
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/pos" element={<POSPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/history" element={<SalesHistoryPage />} />
              <Route path="/" element={<DashboardPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;