import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Overview from './overview';
import TransactionDetails from './transactions';

const Budget = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isOverview = location.pathname.includes('/overview');
  const isTransactions = location.pathname.includes('/transactions');

  return (
    <div>
      {/* Tab Navigation */}
      <div className="mb-5 flex items-center gap-2 rounded-lg bg-white p-2 dark:bg-navy-800">
        <button
          onClick={() => navigate('/admin/budget/overview')}
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
            isOverview
              ? 'bg-brand-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => navigate('/admin/budget/transactions')}
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
            isTransactions
              ? 'bg-brand-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-700'
          }`}
        >
          Transaction Details
        </button>
      </div>

      {/* Routes */}
      <Routes>
        <Route path="overview" element={<Overview />} />
        <Route path="transactions" element={<TransactionDetails />} />
        <Route path="*" element={<Navigate to="/admin/budget/overview" replace />} />
      </Routes>
    </div>
  );
};

export default Budget;
