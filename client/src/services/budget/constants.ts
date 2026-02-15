// Budget Transaction Constants

// Valid transaction categories
export const CATEGORIES = {
  INCOME: 'Income',
  EXPENSE: 'Expense',
  SAVINGS: 'Savings'
} as const;

// Type for category values
export type CategoryType = typeof CATEGORIES[keyof typeof CATEGORIES];

// Array of valid categories for validation
export const VALID_CATEGORIES: CategoryType[] = Object.values(CATEGORIES);

// Field configuration for each category
export const FIELD_CONFIG = {
  // Common fields for all categories
  common: {
    required: ['source', 'category', 'purpose', 'dueDate', 'amount'],
    optional: ['expectedAmount']
  },

  // Income specific fields
  [CATEGORIES.INCOME]: {
    required: ['source', 'category', 'purpose', 'dueDate', 'amount'],
    optional: ['expectedAmount'],
    excluded: ['target', 'currentAmount', 'stepupDate', 'stepupAmount']
  },

  // Expense specific fields
  [CATEGORIES.EXPENSE]: {
    required: ['source', 'category', 'purpose', 'dueDate', 'amount'],
    optional: ['expectedAmount'],
    excluded: ['target', 'currentAmount', 'stepupDate', 'stepupAmount']
  },

  // Savings (SIP) specific fields
  [CATEGORIES.SAVINGS]: {
    required: ['source', 'category', 'purpose', 'dueDate', 'amount'],
    optional: ['expectedAmount', 'target', 'currentAmount', 'stepupDate', 'stepupAmount'],
    excluded: []
  }
} as const;

// Field metadata type
export interface FieldMetadata {
  label: string;
  type: 'text' | 'number' | 'select' | 'date';
  placeholder?: string;
  min?: number;
  max?: number;
  options?: readonly string[];
  description: string;
}

// Field metadata (labels, types, placeholders)
export const FIELD_METADATA: Record<string, FieldMetadata> = {
  source: {
    label: 'Source',
    type: 'text',
    placeholder: 'e.g., Monthly Salary, Rent, SIP - HDFC Equity',
    description: 'Name of the income source, expense, or savings plan'
  },
  category: {
    label: 'Category',
    type: 'select',
    options: VALID_CATEGORIES,
    description: 'Type of transaction'
  },
  purpose: {
    label: 'Purpose',
    type: 'text',
    placeholder: 'e.g., Primary income, House rent, Retirement fund',
    description: 'Brief description of the transaction purpose'
  },
  dueDate: {
    label: 'Due Date',
    type: 'number',
    placeholder: '1-31',
    min: 1,
    max: 31,
    description: 'Day of month when transaction occurs'
  },
  amount: {
    label: 'Amount',
    type: 'number',
    placeholder: '0',
    min: 0,
    description: 'Actual transaction amount (updated when dueDate matches current date)'
  },
  expectedAmount: {
    label: 'Expected Amount',
    type: 'number',
    placeholder: '0',
    min: 0,
    description: 'Expected/budgeted amount for this transaction'
  },
  target: {
    label: 'Target Amount',
    type: 'number',
    placeholder: '0',
    min: 0,
    description: 'Goal amount for savings (e.g., SIP target of ₹2,00,000)'
  },
  currentAmount: {
    label: 'Current Amount',
    type: 'number',
    placeholder: '0',
    min: 0,
    description: 'Current accumulated amount towards target'
  },
  stepupDate: {
    label: 'Step-up Date',
    type: 'text',
    placeholder: 'e.g., 2026-04-01',
    description: 'Date when SIP amount should increase (format: YYYY-MM-DD)'
  },
  stepupAmount: {
    label: 'Step-up Amount',
    type: 'number',
    placeholder: '0',
    min: 0,
    description: 'Amount to increase SIP by on step-up date'
  }
};

// Validation rules
export const VALIDATION_RULES = {
  dueDate: {
    min: 1,
    max: 31,
    message: 'Due date must be between 1 and 31'
  },
  amount: {
    min: 0,
    message: 'Amount must be a positive number'
  }
};

// Helper function to get fields for a specific category
export const getFieldsForCategory = (category: CategoryType) => {
  return FIELD_CONFIG[category] || FIELD_CONFIG.common;
};

// Helper function to check if field is required for category
export const isFieldRequired = (field: string, category: CategoryType): boolean => {
  const config = getFieldsForCategory(category);
  return (config.required as readonly string[]).includes(field);
};

// Helper function to check if field is optional for category
export const isFieldOptional = (field: string, category: CategoryType): boolean => {
  const config = getFieldsForCategory(category);
  return (config.optional as readonly string[]).includes(field);
};

// Helper function to check if field should be shown for category
export const shouldShowField = (field: string, category: CategoryType): boolean => {
  const config = getFieldsForCategory(category);
  // If excluded property doesn't exist, show the field
  if (!('excluded' in config)) return true;
  return !(config.excluded as readonly string[]).includes(field);
};
