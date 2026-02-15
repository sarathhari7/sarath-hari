import React from "react";
import CardMenu from "components/card/CardMenu";
import Card from "components/card";
import Progress from "components/progress";
import AddTransactionDialog from "./AddTransactionDialog";
import DeleteTransactionDialog from "./DeleteTransactionDialog";
import MonthPicker from "components/monthPicker/MonthPicker";
import { MdDelete } from "react-icons/md";
import { useMonth } from "../contexts/MonthContext";
import {
  getMonthTransactions,
  deleteMonthTransaction,
  deleteTemplateFromMonth,
  MonthlyTransaction
} from "services/budget";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

const columnHelper = createColumnHelper<MonthlyTransaction>();

export default function ComplexTable(props: {
  viewMode: 'current' | 'final';
  setViewMode: (mode: 'current' | 'final') => void;
}) {
  const { viewMode, setViewMode } = props;
  const { monthKey, monthName, isPastMonth } = useMonth();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [data, setData] = React.useState<MonthlyTransaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [transactionToDelete, setTransactionToDelete] = React.useState<MonthlyTransaction | null>(null);

  const today = new Date().getDate();

  // Fetch transactions when month changes
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMonthTransactions(monthKey);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setData([]);
        console.error('Failed to fetch transactions:', response.error);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteClick = (transaction: MonthlyTransaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (deleteScope: 'month-only' | 'from-month-onwards') => {
    if (!transactionToDelete) return;

    try {
      if (deleteScope === 'month-only') {
        await deleteMonthTransaction(monthKey, transactionToDelete.id!);
      } else {
        if (transactionToDelete.templateId) {
          await deleteTemplateFromMonth(transactionToDelete.templateId, monthKey);
        }
      }
      await fetchData();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('An error occurred while deleting the transaction');
    }
  };

  const columns = [
    columnHelper.accessor("source", {
      id: "source",
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">SOURCE</p>
      ),
      cell: (info) => (
        <p className="text-sm font-bold text-navy-700 dark:text-white">
          {info.getValue()}
        </p>
      ),
    }),
    columnHelper.accessor("category", {
      id: "category",
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">CATEGORY</p>
      ),
      cell: (info) => {
        const category = info.getValue();
        const getBadgeClass = () => {
          switch(category) {
            case 'Income':
              return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
            case 'Expense':
              return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
            case 'Savings':
              return 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300';
            default:
              return 'bg-gray-100 text-gray-700';
          }
        };
        return (
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getBadgeClass()}`}>
            {category}
          </span>
        );
      },
    }),
    columnHelper.accessor("purpose", {
      id: "purpose",
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">PURPOSE</p>
      ),
      cell: (info) => (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {info.getValue()}
        </p>
      ),
    }),
    columnHelper.accessor("target", {
      id: "target",
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">TARGET</p>
      ),
      cell: (info) => {
        const row = info.row.original;
        if (!row.target) return <span className="text-xs text-gray-400">-</span>;

        const progress = ((row.currentAmount || 0) / row.target) * 100;
        return (
          <div className="flex flex-col gap-1">
            <Progress width="w-[120px]" value={progress} />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              ₹{(row.currentAmount || 0).toLocaleString('en-IN')} / ₹{row.target.toLocaleString('en-IN')}
            </p>
          </div>
        );
      },
    }),
    columnHelper.accessor("stepupDate", {
      id: "stepupDate",
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">STEPUP</p>
      ),
      cell: (info) => {
        const row = info.row.original;
        if (!row.stepupDate) return <span className="text-xs text-gray-400">-</span>;
        return (
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-navy-700 dark:text-white">{row.stepupDate}</p>
            {row.stepupAmount && (
              <p className="text-xs text-brand-500">+₹{row.stepupAmount}</p>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("dueDate", {
      id: "dueDate",
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">DUE DATE</p>
      ),
      cell: (info) => (
        <p className="text-sm font-bold text-navy-700 dark:text-white">
          {info.getValue()}
        </p>
      ),
    }),
    columnHelper.accessor("expectedAmount", {
      id: "expectedAmount",
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">EXPECTED</p>
      ),
      cell: (info) => {
        const expected = info.getValue();
        if (!expected) return <span className="text-xs text-gray-400">-</span>;
        return (
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            ₹{expected.toLocaleString('en-IN')}
          </p>
        );
      },
    }),
    columnHelper.accessor("amount", {
      id: "amount",
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">ACTUAL</p>
      ),
      cell: (info) => {
        const row = info.row.original;
        const actual = info.getValue();
        const expected = row.expectedAmount;
        const isPast = parseInt(row.dueDate) <= today;

        // Show amount only if in Final mode or if due date has passed
        const shouldShowAmount = viewMode === 'final' || isPast;

        if (!shouldShowAmount) {
          return <span className="text-xs text-gray-400">Pending</span>;
        }

        // Determine color based on variance
        let colorClass = 'text-navy-700 dark:text-white';
        if (expected) {
          if (row.category === 'Income' && actual > expected) {
            colorClass = 'text-green-600 dark:text-green-400'; // Higher income is good
          } else if (row.category === 'Income' && actual < expected) {
            colorClass = 'text-red-600 dark:text-red-400'; // Lower income is bad
          } else if ((row.category === 'Expense' || row.category === 'Savings') && actual > expected) {
            colorClass = 'text-red-600 dark:text-red-400'; // Higher expense/savings is bad (overspend)
          } else if ((row.category === 'Expense' || row.category === 'Savings') && actual < expected) {
            colorClass = 'text-green-600 dark:text-green-400'; // Lower expense is good (saved money)
          }
        }

        return (
          <div className="flex flex-col">
            <p className={`text-sm font-bold ${colorClass}`}>
              ₹{actual.toLocaleString('en-IN')}
            </p>
            {expected && actual !== expected && (
              <p className={`text-xs ${colorClass}`}>
                {actual > expected ? '+' : ''}{(actual - expected).toLocaleString('en-IN')}
              </p>
            )}
          </div>
        );
      },
    }),
    // Actions column
    columnHelper.display({
      id: "actions",
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">ACTIONS</p>
      ),
      cell: (info) => {
        const row = info.row.original;
        if (!row.id) return null;

        return (
          <button
            onClick={() => handleDeleteClick(row)}
            className="inline-flex items-center justify-center rounded-md p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            title="Delete transaction"
          >
            <MdDelete className="h-5 w-5" />
          </button>
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  // Calculate totals based on view mode
  const calculateTotals = () => {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalSavings = 0;

    data.forEach((row) => {
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

  const totals = calculateTotals();

  return (
    <Card extra={"w-full h-full px-6 pb-6 sm:overflow-x-auto"}>
      <div className="relative flex items-center justify-between pt-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white whitespace-nowrap">
          Budget Transactions
        </div>
        <div className="flex items-center gap-3">
          {/* Month Picker */}
          <MonthPicker />

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-navy-700 dark:text-white">
              Current
            </span>
            <button
              onClick={() => setViewMode(viewMode === 'current' ? 'final' : 'current')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                viewMode === 'final' ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  viewMode === 'final' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm font-medium text-navy-700 dark:text-white">
              Final
            </span>
          </div>
          <AddTransactionDialog onSuccess={fetchData} />
          <CardMenu />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-gray-600 dark:text-gray-400">Loading transactions...</div>
        </div>
      ) : (
        <div className="mt-6 overflow-x-scroll xl:overflow-x-hidden">
          <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="!border-px !border-gray-400">
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      onClick={header.column.getToggleSortingHandler()}
                      className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start"
                    >
                      <div className="items-center justify-between text-xs text-gray-200">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: "",
                          desc: "",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table
              .getRowModel()
              .rows
              .map((row) => {
                return (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td
                          key={cell.id}
                          className="min-w-[120px] border-white/0 py-3 pr-4"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            {/* Totals Row */}
            <tr className="border-t-2 border-gray-300 dark:border-gray-600">
              <td colSpan={7} className="py-4 pr-4">
                <div className="flex items-center justify-end gap-8 text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Income:</span>
                    <span className="text-green-600 dark:text-green-400">
                      ₹{totals.totalIncome.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Expense:</span>
                    <span className="text-red-600 dark:text-red-400">
                      ₹{totals.totalExpense.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Savings:</span>
                    <span className="text-brand-600 dark:text-brand-400">
                      ₹{totals.totalSavings.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-lightPrimary px-4 py-2 dark:bg-navy-800">
                    <span className="text-navy-700 dark:text-white">Balance:</span>
                    <span className={`text-lg ${totals.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      ₹{totals.balance.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      )}

      {/* Delete Transaction Dialog */}
      {transactionToDelete && (
        <DeleteTransactionDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          transaction={transactionToDelete}
          monthKey={monthKey}
          monthName={monthName}
          isPastMonth={isPastMonth}
          onDelete={handleDeleteConfirm}
        />
      )}
    </Card>
  );
}
