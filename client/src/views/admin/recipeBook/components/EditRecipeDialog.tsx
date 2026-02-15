import React, { useState, useEffect } from 'react';
import { MdEdit } from 'react-icons/md';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from 'components/ui/dialog';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Recipe, updateRecipe, TimeUnit } from 'services/recipe';

interface EditRecipeDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditRecipeDialog: React.FC<EditRecipeDialogProps> = ({
  recipe,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: string;
    servingSize: string;
    totalTimeValue: string;
    totalTimeUnit: TimeUnit;
    notes: string;
  }>({
    title: '',
    description: '',
    category: '',
    servingSize: '',
    totalTimeValue: '',
    totalTimeUnit: 'minutes',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recipe && open) {
      setFormData({
        title: recipe.title || '',
        description: recipe.description || '',
        category: recipe.category || '',
        servingSize: String(recipe.servingSize || ''),
        totalTimeValue: String(recipe.totalTimeValue || ''),
        totalTimeUnit: recipe.totalTimeUnit || 'minutes',
        notes: recipe.notes || '',
      });
      setError(null);
    }
  }, [recipe, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.category.trim()) return 'Category is required';
    if (!formData.servingSize || Number(formData.servingSize) <= 0) {
      return 'Serving size must be greater than 0';
    }
    if (!formData.totalTimeValue || Number(formData.totalTimeValue) <= 0) {
      return 'Total time must be greater than 0';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipe) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dataToSubmit = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        servingSize: Number(formData.servingSize),
        totalTimeValue: Number(formData.totalTimeValue),
        totalTimeUnit: formData.totalTimeUnit,
        notes: formData.notes.trim(),
      };

      await updateRecipe(recipe.id, dataToSubmit);
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Error updating recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MdEdit className="h-5 w-5" />
            Edit Recipe
          </DialogTitle>
          <DialogDescription>
            Update the recipe details below. Only basic information can be edited here.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter recipe title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the recipe"
              rows={3}
              className="w-full rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-2 text-sm text-navy-700 dark:text-white placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Enter category"
              required
            />
          </div>

          {/* Serving Size and Total Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="servingSize">Serving Size *</Label>
              <Input
                id="servingSize"
                name="servingSize"
                type="number"
                min="1"
                value={formData.servingSize}
                onChange={handleChange}
                placeholder="e.g., 4"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalTimeValue">Total Time *</Label>
              <div className="flex gap-2">
                <Input
                  id="totalTimeValue"
                  name="totalTimeValue"
                  type="number"
                  min="1"
                  value={formData.totalTimeValue}
                  onChange={handleChange}
                  placeholder="e.g., 45"
                  className="flex-1"
                  required
                />
                <select
                  name="totalTimeUnit"
                  value={formData.totalTimeUnit}
                  onChange={handleChange}
                  className="rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-2 text-sm text-navy-700 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="minutes">mins</option>
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any special notes, tips, or variations"
              rows={4}
              className="w-full rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-2 text-sm text-navy-700 dark:text-white placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>Updating...</>
              ) : (
                <>
                  <MdEdit className="h-4 w-4" />
                  Update Recipe
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRecipeDialog;
