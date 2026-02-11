import MiniCalendar from "components/calendar/MiniCalendar";
import { MdAccountBalanceWallet, MdTrendingUp, MdTrendingDown, MdSavings } from "react-icons/md";
import { IoWallet } from "react-icons/io5";

import Widget from "components/widget/Widget";
import ComplexTable from "views/admin/default/components/ComplexTable";
import tableDataComplex from "./variables/tableDataComplex";
import React from "react";

const Dashboard = () => {
  const [viewMode, setViewMode] = React.useState<'current' | 'final'>('current');
  const today = new Date().getDate();

  // Calculate budget summary
  const calculateSummary = () => {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalSavings = 0;

    tableDataComplex.forEach((row) => {
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

  return (
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
        <ComplexTable tableData={tableDataComplex} viewMode={viewMode} setViewMode={setViewMode} />

        {/* Calendar */}
        <MiniCalendar />
      </div>
    </div>
  );
};

export default Dashboard;
