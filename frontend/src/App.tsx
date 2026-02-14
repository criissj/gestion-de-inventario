import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, History } from 'lucide-react';
import InventoryPage from './pages/InventoryPage';
import POSPage from './pages/POSPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-blue-600">Inventory App</h1>
          </div>
          <nav className="mt-4">
            <Link to="/dashboard" className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700">
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
            <Link to="/pos" className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700">
              <ShoppingCart className="w-5 h-5 mr-3" />
              Point of Sale
            </Link>
            <Link to="/inventory" className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700">
              <Package className="w-5 h-5 mr-3" />
              Inventory
            </Link>
            <Link to="/history" className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700">
              <History className="w-5 h-5 mr-3" />
              Sales History
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/pos" element={<POSPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/history" element={<SalesHistoryPage />} />
            <Route path="/" element={<DashboardPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
