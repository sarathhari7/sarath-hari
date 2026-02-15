import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "components/ui/dialog";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { MdAdd } from 'react-icons/md';
import {
  CATEGORIES,
  VALID_CATEGORIES,
  FIELD_METADATA,
  shouldShowField,
  CategoryType
} from 'services/budget/constants';
import { createTemplate, createMonthOnlyTransaction, BudgetTransaction } from 'services/budget';
import { useMonth } from '../contexts/MonthContext';

interface AddTransactionDialogProps {
  onSuccess: () => void;
}

const AddTransactionDialog: React.FC<AddTransactionDialogProps> = ({ onSuccess }) => {
  const { monthKey, monthName, isPastMonth } = useMonth();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isRecurring, setIsRecurring] = React.useState(!isPastMonth);

  // Form state
  const [formData, setFormData] = React.useState<Partial<BudgetTransaction>>({
    category: CATEGORIES.INCOME,
    source: '',
    purpose: '',
    dueDate: '',
    dateType: 'fixed',
    dynamicDateRule: 'next',
    amount: 0,
    expectedAmount: 0,
  });

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setFormData({
        category: CATEGORIES.INCOME,
        source: '',
        purpose: '',
        dueDate: '',
        dateType: 'fixed',
        dynamicDateRule: 'next',
        amount: 0,
        expectedAmount: 0,
      });
      setError(null);
      setIsRecurring(!isPastMonth);
    }
  }, [open, isPastMonth]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryChange = (category: CategoryType) => {
    // Reset optional fields when category changes
    setFormData(prev => ({
      category,
      source: prev.source,
      purpose: prev.purpose,
      dueDate: prev.dueDate,
      amount: prev.amount,
      expectedAmount: prev.expectedAmount,
    }));
  };

  const validateForm = (): string | null => {
    const { source, category, purpose, dueDate, amount } = formData;

    if (!source?.trim()) return 'Source is required';
    if (!category) return 'Category is required';
    if (!purpose?.trim()) return 'Purpose is required';
    if (!dueDate) return 'Due date is required';
    if (amount === undefined || amount === null) return 'Amount is required';

    const dueDateNum = parseInt(String(dueDate));
    if (isNaN(dueDateNum) || dueDateNum < 1 || dueDateNum > 31) {
      return 'Due date must be between 1 and 31';
    }

    if (amount < 0) return 'Amount must be positive';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Clean up data - only send fields that are set
      const dataToSubmit: any = {
        source: formData.source,
        category: formData.category,
        purpose: formData.purpose,
        dueDate: String(formData.dueDate),
        dateType: formData.dateType || 'fixed',
        dynamicDateRule: formData.dynamicDateRule || 'next',
        amount: Number(formData.amount),
      };

      // Add optional fields if they have values
      if (formData.expectedAmount) dataToSubmit.expectedAmount = Number(formData.expectedAmount);
      if (formData.target) dataToSubmit.target = Number(formData.target);
      if (formData.currentAmount) dataToSubmit.currentAmount = Number(formData.currentAmount);
      if (formData.stepupDate) dataToSubmit.stepupDate = formData.stepupDate;
      if (formData.stepupAmount) dataToSubmit.stepupAmount = Number(formData.stepupAmount);

      let response;

      if (isRecurring && !isPastMonth) {
        // Create template (applies to current + future months)
        response = await createTemplate(dataToSubmit);
      } else {
        // Create month-only transaction
        response = await createMonthOnlyTransaction(monthKey, dataToSubmit);
      }

      if (response.success) {
        setOpen(false);
        onSuccess();
      } else {
        setError(response.error || 'Failed to create transaction');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error creating transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = formData.category || CATEGORIES.INCOME;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
          <MdAdd className="h-5 w-5" />
          Add Transaction
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Fill in the transaction details below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Category, Source, Purpose */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {VALID_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">
                Source <span className="text-red-500">*</span>
              </Label>
              <Input
                id="source"
                type="text"
                placeholder="e.g., Salary"
                value={formData.source || ''}
                onChange={(e) => handleInputChange('source', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">
                Purpose <span className="text-red-500">*</span>
              </Label>
              <Input
                id="purpose"
                type="text"
                placeholder="e.g., Monthly"
                value={formData.purpose || ''}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Row 2: Due Date, Amount, Expected Amount */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dueDate"
                type="number"
                placeholder="1-31"
                min={FIELD_METADATA.dueDate.min}
                max={FIELD_METADATA.dueDate.max}
                value={formData.dueDate || ''}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                min={FIELD_METADATA.amount.min}
                value={formData.amount || 0}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            {shouldShowField('expectedAmount', selectedCategory) && (
              <div className="space-y-2">
                <Label htmlFor="expectedAmount">Expected Amount</Label>
                <Input
                  id="expectedAmount"
                  type="number"
                  placeholder="0"
                  min={FIELD_METADATA.expectedAmount.min}
                  value={formData.expectedAmount || 0}
                  onChange={(e) => handleInputChange('expectedAmount', parseFloat(e.target.value) || 0)}
                />
              </div>
            )}
          </div>

          {/* Row 3: Date Type Options */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="text-sm font-semibold text-navy-700 dark:text-white">Due Date Behavior</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Choose how the due date should behave when it falls on weekends
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateType">Date Type</Label>
                <Select
                  value={formData.dateType || 'fixed'}
                  onValueChange={(value) => handleInputChange('dateType', value)}
                >
                  <SelectTrigger id="dateType">
                    <SelectValue placeholder="Select date type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">
                      <div className="flex flex-col">
                        <span className="font-medium">Fixed</span>
                        <span className="text-xs text-gray-500">Same date every month</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dynamic">
                      <div className="flex flex-col">
                        <span className="font-medium">Dynamic</span>
                        <span className="text-xs text-gray-500">Adjusts for weekends</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.dateType === 'dynamic' && (
                <div className="space-y-2">
                  <Label htmlFor="dynamicDateRule">Weekend Rule</Label>
                  <Select
                    value={formData.dynamicDateRule || 'next'}
                    onValueChange={(value) => handleInputChange('dynamicDateRule', value)}
                  >
                    <SelectTrigger id="dynamicDateRule">
                      <SelectValue placeholder="Select rule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="next">
                        <div className="flex flex-col">
                          <span className="font-medium">Next Working Day</span>
                          <span className="text-xs text-gray-500">Sat/Sun → Monday</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="previous">
                        <div className="flex flex-col">
                          <span className="font-medium">Previous Working Day</span>
                          <span className="text-xs text-gray-500">Sat/Sun → Friday</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {formData.dateType === 'dynamic' && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  <strong>Example:</strong> If due date {formData.dueDate || '3'} falls on a{' '}
                  {formData.dynamicDateRule === 'next' ? 'Saturday, it will be moved to the next Monday. If it falls on Sunday, it will be moved to Monday.' : 'Saturday, it will be moved to Friday. If it falls on Sunday, it will be moved to the previous Friday.'}
                </p>
              </div>
            )}
          </div>

          {/* SIP/Savings specific fields */}
          {selectedCategory === CATEGORIES.SAVINGS && (
            <div className="border-t pt-4 space-y-4">
              <h3 className="text-sm font-semibold">SIP/Savings Details (Optional)</h3>

              {/* Target and Current Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target">Target Amount</Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="2,00,000"
                    min={FIELD_METADATA.target.min}
                    value={formData.target || ''}
                    onChange={(e) => handleInputChange('target', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentAmount">Current Amount</Label>
                  <Input
                    id="currentAmount"
                    type="number"
                    placeholder="50,000"
                    min={FIELD_METADATA.currentAmount.min}
                    value={formData.currentAmount || ''}
                    onChange={(e) => handleInputChange('currentAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Step-up Date and Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stepupDate">Step-up Date</Label>
                  <Input
                    id="stepupDate"
                    type="date"
                    value={formData.stepupDate || ''}
                    onChange={(e) => handleInputChange('stepupDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stepupAmount">Step-up Amount</Label>
                  <Input
                    id="stepupAmount"
                    type="number"
                    placeholder="500"
                    min={FIELD_METADATA.stepupAmount.min}
                    value={formData.stepupAmount || ''}
                    onChange={(e) => handleInputChange('stepupAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Recurring transaction option */}
          {!isPastMonth && (
            <div className="flex items-center space-x-2 border-t pt-4">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              <Label htmlFor="isRecurring" className="text-sm font-normal cursor-pointer">
                Add as recurring transaction (applies to {monthName} and all future months)
              </Label>
            </div>
          )}

          {isPastMonth && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-700 dark:text-amber-400">
              Adding to past month ({monthName}). This transaction will only appear in this month.
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionDialog;
