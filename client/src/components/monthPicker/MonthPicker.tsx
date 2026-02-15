import React from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { useMonth } from 'views/admin/budget/contexts/MonthContext';

const MonthPicker: React.FC = () => {
  const {
    monthName,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    isCurrentMonth
  } = useMonth();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-2 py-1.5">
      <button
        onClick={goToPreviousMonth}
        className="text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors p-1"
        aria-label="Previous month"
      >
        <MdChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={goToCurrentMonth}
        className="min-w-[140px] px-2 text-sm font-medium text-navy-700 dark:text-white hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
      >
        {monthName}
        {isCurrentMonth && (
          <span className="ml-2 text-xs text-brand-500">(Current)</span>
        )}
      </button>

      <button
        onClick={goToNextMonth}
        className="text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors p-1"
        aria-label="Next month"
      >
        <MdChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default MonthPicker;
