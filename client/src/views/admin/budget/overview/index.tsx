import React, { useState, useEffect } from 'react';
import Card from 'components/card';
import { MdTrendingUp, MdTrendingDown, MdAccountBalanceWallet } from 'react-icons/md';
import ReactApexChart from 'react-apexcharts';
import { getMonthTransactions, MonthlyTransaction } from 'services/budget';

type MetricType = 'income' | 'expense' | 'balance';

interface MonthData {
  month: string;
  monthKey: string;
  income: number;
  expense: number;
  savings: number;
  balance: number;
}

const Overview = () => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('income');
  const [monthsData, setMonthsData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate last 12 months
  const generateMonthKeys = (): { monthKey: string; monthLabel: string }[] => {
    const months: { monthKey: string; monthLabel: string }[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      months.push({ monthKey, monthLabel });
    }

    return months;
  };

  // Fetch data for all months
  useEffect(() => {
    const fetchAllMonthsData = async () => {
      setLoading(true);
      const monthKeys = generateMonthKeys();
      const dataPromises = monthKeys.map(async ({ monthKey, monthLabel }) => {
        const response = await getMonthTransactions(monthKey);

        if (response.success && response.data) {
          const transactions = response.data;
          let income = 0;
          let expense = 0;
          let savings = 0;

          transactions.forEach((t: MonthlyTransaction) => {
            if (t.category === 'Income') income += t.amount;
            else if (t.category === 'Expense') expense += t.amount;
            else if (t.category === 'Savings') savings += t.amount;
          });

          const balance = income - expense - savings;

          return {
            month: monthLabel,
            monthKey,
            income,
            expense,
            savings,
            balance,
          };
        }

        return {
          month: monthLabel,
          monthKey,
          income: 0,
          expense: 0,
          savings: 0,
          balance: 0,
        };
      });

      const data = await Promise.all(dataPromises);
      setMonthsData(data);
      setLoading(false);
    };

    fetchAllMonthsData();
  }, []);

  // Prepare chart data based on selected metric
  const getChartData = () => {
    const categories = monthsData.map((d) => d.month);
    let seriesData: number[] = [];
    let seriesName = '';
    let color = '';

    switch (selectedMetric) {
      case 'income':
        seriesData = monthsData.map((d) => d.income);
        seriesName = 'Income';
        color = '#10b981'; // green
        break;
      case 'expense':
        seriesData = monthsData.map((d) => d.expense);
        seriesName = 'Expense';
        color = '#ef4444'; // red
        break;
      case 'balance':
        seriesData = monthsData.map((d) => d.balance);
        seriesName = 'Balance';
        color = '#3b82f6'; // blue
        break;
    }

    return { categories, seriesData, seriesName, color };
  };

  const { categories, seriesData, seriesName, color } = getChartData();

  // ApexCharts configuration
  const chartOptions: any = {
    chart: {
      type: 'line',
      toolbar: {
        show: false,
      },
      background: 'transparent',
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    colors: [color],
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: '#A3AED0',
          fontSize: '12px',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#A3AED0',
          fontSize: '12px',
        },
        formatter: (value: number) => {
          return `₹${value.toLocaleString('en-IN')}`;
        },
      },
    },
    grid: {
      borderColor: '#E2E8F0',
      strokeDashArray: 5,
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (value: number) => {
          return `₹${value.toLocaleString('en-IN')}`;
        },
      },
    },
    markers: {
      size: 5,
      colors: [color],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
  };

  const chartSeries = [
    {
      name: seriesName,
      data: seriesData,
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent"></div>
          <p className="text-lg text-gray-600 dark:text-white">Loading overview data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Card extra="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
              Budget Overview
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Last 12 months trend
            </p>
          </div>

          {/* Radio Buttons */}
          <div className="flex gap-2 rounded-lg bg-gray-100 p-1 dark:bg-navy-900">
            <button
              onClick={() => setSelectedMetric('income')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                selectedMetric === 'income'
                  ? 'bg-white text-green-600 shadow-md dark:bg-navy-800'
                  : 'text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-500'
              }`}
            >
              <MdTrendingUp className="h-5 w-5" />
              Income
            </button>
            <button
              onClick={() => setSelectedMetric('expense')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                selectedMetric === 'expense'
                  ? 'bg-white text-red-600 shadow-md dark:bg-navy-800'
                  : 'text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500'
              }`}
            >
              <MdTrendingDown className="h-5 w-5" />
              Expense
            </button>
            <button
              onClick={() => setSelectedMetric('balance')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                selectedMetric === 'balance'
                  ? 'bg-white text-blue-600 shadow-md dark:bg-navy-800'
                  : 'text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500'
              }`}
            >
              <MdAccountBalanceWallet className="h-5 w-5" />
              Balance
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[400px]">
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="line"
            height="100%"
          />
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card extra="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average {seriesName}</p>
              <p className="mt-2 text-2xl font-bold text-navy-700 dark:text-white">
                ₹{(seriesData.reduce((a, b) => a + b, 0) / seriesData.length || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className={`rounded-full p-3 ${
              selectedMetric === 'income' ? 'bg-green-100 dark:bg-green-900/20' :
              selectedMetric === 'expense' ? 'bg-red-100 dark:bg-red-900/20' :
              'bg-blue-100 dark:bg-blue-900/20'
            }`}>
              {selectedMetric === 'income' && <MdTrendingUp className="h-6 w-6 text-green-600 dark:text-green-500" />}
              {selectedMetric === 'expense' && <MdTrendingDown className="h-6 w-6 text-red-600 dark:text-red-500" />}
              {selectedMetric === 'balance' && <MdAccountBalanceWallet className="h-6 w-6 text-blue-600 dark:text-blue-500" />}
            </div>
          </div>
        </Card>

        <Card extra="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Highest {seriesName}</p>
              <p className="mt-2 text-2xl font-bold text-navy-700 dark:text-white">
                ₹{Math.max(...seriesData).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="rounded-full bg-brand-100 p-3 dark:bg-brand-900/20">
              <MdTrendingUp className="h-6 w-6 text-brand-600 dark:text-brand-500" />
            </div>
          </div>
        </Card>

        <Card extra="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lowest {seriesName}</p>
              <p className="mt-2 text-2xl font-bold text-navy-700 dark:text-white">
                ₹{Math.min(...seriesData).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
              <MdTrendingDown className="h-6 w-6 text-orange-600 dark:text-orange-500" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
