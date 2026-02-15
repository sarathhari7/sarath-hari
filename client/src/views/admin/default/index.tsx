import MiniCalendar from "components/calendar/MiniCalendar";
import { MdTrendingUp, MdTrendingDown, MdSavings } from "react-icons/md";
import { IoWallet } from "react-icons/io5";

import Widget from "components/widget/Widget";
import ComplexTable from "views/admin/budget/components/ComplexTable";
import { getAllTransactions, BudgetTransaction } from "services/budget";
import { ApiResponse } from "services/api";
import { MonthProvider } from "views/admin/budget/contexts/MonthContext";
import React from "react";

const Dashboard = () => {
  const [viewMode, setViewMode] = React.useState<'current' | 'final'>('current');
  const [transactions, setTransactions] = React.useState<BudgetTransaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<ApiResponse<any> | null>(null);
  const today = new Date().getDate();

  // Fetch budget transactions from API
  const fetchTransactions = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllTransactions();

      if (response.success && response.data) {
        setTransactions(response.data);
        setError(null);
      } else {
        setError(response);
        console.error('Failed to fetch transactions:', {
          error: response.error,
          errorType: response.errorType,
          details: response.details,
          timestamp: response.timestamp
        });
      }
    } catch (err) {
      const errorResponse: ApiResponse<any> = {
        success: false,
        error: 'An unexpected error occurred',
        errorType: 'NETWORK_ERROR',
        details: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString()
      };
      setError(errorResponse);
      console.error('Unexpected error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Calculate budget summary
  const calculateSummary = () => {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalSavings = 0;

    transactions.forEach((row) => {
      const isPast = parseInt(row.dueDate) <= today;
      const shouldInclude = viewMode === 'final' || isPast;

      if (shouldInclude) {
        if (row.category === 'Income') {
          totalIncome += row.amount;
        } else if (row.category === 'Expense') {
          totalExpense += row.amount;
        } else if (row.category === 'Savings') {
          totalSavings += row.amount;
        }
      }
    });

    const balance = totalIncome - totalExpense - totalSavings;
    return { totalIncome, totalExpense, totalSavings, balance };
  };

  const summary = calculateSummary();

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent"></div>
          <p className="text-lg text-gray-600 dark:text-white">Loading budget data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-full max-w-2xl text-center px-4">
          <div className="mb-4 text-6xl">⚠️</div>
          <p className="mb-2 text-xl font-bold text-red-600 dark:text-red-400">Error Loading Data</p>
          <p className="mb-2 text-lg text-gray-700 dark:text-gray-300">{error.error}</p>

          {error.errorType && (
            <div className="mt-4 rounded-lg bg-gray-100 dark:bg-navy-700 p-4 text-left">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Error Details:</p>
              <div className="space-y-1 text-sm font-mono text-gray-600 dark:text-gray-400">
                <p><span className="font-bold">Type:</span> {error.errorType}</p>
                {error.details && <p><span className="font-bold">Details:</span> {error.details}</p>}
                {error.timestamp && <p><span className="font-bold">Time:</span> {new Date(error.timestamp).toLocaleString()}</p>}
              </div>
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-brand-500 px-6 py-2 text-white hover:bg-brand-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <MonthProvider>
      <div>
        {/* Budget Summary Cards */}
        <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Widget
            icon={<MdTrendingUp className="h-7 w-7" />}
            title={"Income"}
            subtitle={`₹${summary.totalIncome.toLocaleString('en-IN')}`}
          />
          <Widget
            icon={<MdTrendingDown className="h-6 w-6" />}
            title={"Expense"}
            subtitle={`₹${summary.totalExpense.toLocaleString('en-IN')}`}
          />
          <Widget
            icon={<MdSavings className="h-7 w-7" />}
            title={"Savings"}
            subtitle={`₹${summary.totalSavings.toLocaleString('en-IN')}`}
          />
          <Widget
            icon={<IoWallet className="h-6 w-6" />}
            title={"Balance"}
            subtitle={`₹${summary.balance.toLocaleString('en-IN')}`}
          />
        </div>

        {/* Tables & Charts */}

        <div className="mt-5 grid grid-cols-1 gap-5">
          {/* Complex Table */}
          <ComplexTable
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {/* Calendar */}
          <MiniCalendar />
        </div>
      </div>
    </MonthProvider>
  );
};

export default Dashboard;
