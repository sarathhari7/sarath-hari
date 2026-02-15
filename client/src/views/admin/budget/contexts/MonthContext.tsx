import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';

interface MonthContextType {
  selectedMonth: Date;
  monthKey: string;
  monthName: string;
  setSelectedMonth: (date: Date) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;
  isCurrentMonth: boolean;
  isPastMonth: boolean;
  isFutureMonth: boolean;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export const MonthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const monthKey = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = String(selectedMonth.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, [selectedMonth]);

  const monthName = useMemo(() => {
    return selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }, [selectedMonth]);

  const currentMonthKey = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);

  const isCurrentMonth = useMemo(() => monthKey === currentMonthKey, [monthKey, currentMonthKey]);
  const isPastMonth = useMemo(() => monthKey < currentMonthKey, [monthKey, currentMonthKey]);
  const isFutureMonth = useMemo(() => monthKey > currentMonthKey, [monthKey, currentMonthKey]);

  const goToPreviousMonth = useCallback(() => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }, []);

  const goToCurrentMonth = useCallback(() => {
    setSelectedMonth(new Date());
  }, []);

  return (
    <MonthContext.Provider value={{
      selectedMonth,
      monthKey,
      monthName,
      setSelectedMonth,
      goToPreviousMonth,
      goToNextMonth,
      goToCurrentMonth,
      isCurrentMonth,
      isPastMonth,
      isFutureMonth
    }}>
      {children}
    </MonthContext.Provider>
  );
};

export const useMonth = () => {
  const context = useContext(MonthContext);
  if (!context) {
    throw new Error('useMonth must be used within MonthProvider');
  }
  return context;
};
