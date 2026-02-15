import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from 'components/ui/alert-dialog';
import { Label } from 'components/ui/label';
import { MonthlyTransaction } from 'services/budget';

interface DeleteTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: MonthlyTransaction;
  monthKey: string;
  monthName: string;
  isPastMonth: boolean;
  onDelete: (deleteScope: 'month-only' | 'from-month-onwards') => Promise<void>;
}

const DeleteTransactionDialog: React.FC<DeleteTransactionDialogProps> = ({
  open,
  onOpenChange,
  transaction,
  monthKey,
  monthName,
  isPastMonth,
  onDelete
}) => {
  const [deleteScope, setDeleteScope] = useState<'month-only' | 'from-month-onwards'>('month-only');
  const [isDeleting, setIsDeleting] = useState(false);

  const hasTemplate = !!transaction.templateId;
  const showScopeOption = hasTemplate && !isPastMonth;

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(deleteScope);
      onOpenChange(false);
      setDeleteScope('month-only'); // Reset for next time
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{transaction.source}"?
            {showScopeOption && ' Choose the scope of deletion:'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {showScopeOption && (
          <div className="space-y-3 py-4">
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                id="delete-month-only"
                name="deleteScope"
                value="month-only"
                checked={deleteScope === 'month-only'}
                onChange={() => setDeleteScope('month-only')}
                className="mt-0.5 h-4 w-4 border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              <Label htmlFor="delete-month-only" className="text-sm font-normal cursor-pointer">
                Delete from <strong>{monthName}</strong> only
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="radio"
                id="delete-onwards"
                name="deleteScope"
                value="from-month-onwards"
                checked={deleteScope === 'from-month-onwards'}
                onChange={() => setDeleteScope('from-month-onwards')}
                className="mt-0.5 h-4 w-4 border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              <Label htmlFor="delete-onwards" className="text-sm font-normal cursor-pointer">
                Delete from <strong>{monthName}</strong> onwards (including all future months)
              </Label>
            </div>
          </div>
        )}

        {isPastMonth && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-700 dark:text-amber-400">
            This will only delete from {monthName}. Future months are not affected.
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTransactionDialog;
