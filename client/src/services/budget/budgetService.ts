import apiCall, { ApiResponse } from '../api';

// Budget transaction type
export interface BudgetTransaction {
  id?: string;
  source: string;
  category: 'Income' | 'Expense' | 'Savings';
  purpose: string;
  target?: number;
  currentAmount?: number;
  stepupDate?: string;
  stepupAmount?: number;
  dueDate: string;
  dateType?: 'fixed' | 'dynamic'; // Date behavior type
  dynamicDateRule?: 'next' | 'previous'; // Rule for dynamic dates (only used if dateType is 'dynamic')
  expectedAmount?: number;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

// Monthly transaction type (extends BudgetTransaction)
export interface MonthlyTransaction extends BudgetTransaction {
  templateId: string | null;
  isCustomized: boolean;
}

// Budget summary type
export interface BudgetSummary {
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  balance: number;
}

// Get all budget transactions
export const getAllTransactions = async (): Promise<ApiResponse<BudgetTransaction[]>> => {
  return apiCall<BudgetTransaction[]>('/api/budget');
};

// Get budget summary (totals)
export const getBudgetSummary = async (): Promise<ApiResponse<BudgetSummary>> => {
  return apiCall<BudgetSummary>('/api/budget/summary');
};

// Get transactions by category
export const getTransactionsByCategory = async (
  category: 'Income' | 'Expense' | 'Savings'
): Promise<ApiResponse<BudgetTransaction[]>> => {
  return apiCall<BudgetTransaction[]>(`/api/budget/category/${category}`);
};

// Get single transaction by ID
export const getTransactionById = async (
  id: string
): Promise<ApiResponse<BudgetTransaction>> => {
  return apiCall<BudgetTransaction>(`/api/budget/${id}`);
};

// Create new transaction
export const createTransaction = async (
  transaction: Omit<BudgetTransaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<BudgetTransaction>> => {
  return apiCall<BudgetTransaction>('/api/budget', {
    method: 'POST',
    body: JSON.stringify(transaction),
  });
};

// Update existing transaction
export const updateTransaction = async (
  id: string,
  updates: Partial<Omit<BudgetTransaction, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ApiResponse<BudgetTransaction>> => {
  return apiCall<BudgetTransaction>(`/api/budget/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

// Delete transaction
export const deleteTransaction = async (
  id: string
): Promise<ApiResponse<{ message: string }>> => {
  return apiCall<{ message: string }>(`/api/budget/${id}`, {
    method: 'DELETE',
  });
};

// ============================================
// NEW MONTH-BASED API FUNCTIONS
// ============================================

// Get all transactions for a specific month
export const getMonthTransactions = async (monthKey: string): Promise<ApiResponse<MonthlyTransaction[]>> => {
  return apiCall<MonthlyTransaction[]>(`/api/budget/month/${monthKey}`);
};

// Create template (recurring transaction)
export const createTemplate = async (
  template: Omit<BudgetTransaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<BudgetTransaction>> => {
  return apiCall<BudgetTransaction>('/api/budget/template', {
    method: 'POST',
    body: JSON.stringify(template),
    successMessage: 'Recurring transaction created successfully',
    errorMessage: 'Failed to create recurring transaction',
  });
};

// Create month-only transaction (non-recurring)
export const createMonthOnlyTransaction = async (
  monthKey: string,
  transaction: Omit<BudgetTransaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<MonthlyTransaction>> => {
  return apiCall<MonthlyTransaction>(`/api/budget/month/${monthKey}/transaction`, {
    method: 'POST',
    body: JSON.stringify(transaction),
    successMessage: 'Transaction added successfully',
    errorMessage: 'Failed to add transaction',
  });
};

// Delete transaction from specific month only
export const deleteMonthTransaction = async (
  monthKey: string,
  transactionId: string
): Promise<ApiResponse<void>> => {
  return apiCall<void>(
    `/api/budget/month/${monthKey}/transaction/${transactionId}`,
    {
      method: 'DELETE',
      successMessage: 'Transaction deleted from selected month',
      errorMessage: 'Failed to delete transaction',
    }
  );
};

// Delete template from specified month onwards
export const deleteTemplateFromMonth = async (
  templateId: string,
  fromMonthKey: string
): Promise<ApiResponse<void>> => {
  return apiCall<void>(
    `/api/budget/template/${templateId}/from/${fromMonthKey}`,
    {
      method: 'DELETE',
      successMessage: 'Transaction deleted from selected month onwards',
      errorMessage: 'Failed to delete transaction',
    }
  );
};
