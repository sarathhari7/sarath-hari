import React, { useState } from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'components/ui/dialog';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { createRecipe, TimeUnit } from 'services/recipe';

interface AddRecipeDialogProps {
  onSuccess: () => void;
}

interface IngredientForm {
  name: string;
  quantity: string;
  unit: string;
}

interface DirectionForm {
  step: number;
  instruction: string;
  duration?: string;
  timeValue?: string;
  timeUnit?: TimeUnit;
}

const AddRecipeDialog: React.FC<AddRecipeDialogProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    servingSize: '',
    totalTimeValue: '',
    totalTimeUnit: 'minutes' as TimeUnit,
    notes: '',
  });

  const [ingredients, setIngredients] = useState<IngredientForm[]>([
    { name: '', quantity: '', unit: '' },
  ]);

  const [directions, setDirections] = useState<DirectionForm[]>([
    { step: 1, instruction: '', duration: '', timeValue: '', timeUnit: 'minutes' },
  ]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      servingSize: '',
      totalTimeValue: '',
      totalTimeUnit: 'minutes',
      notes: '',
    });
    setIngredients([{ name: '', quantity: '', unit: '' }]);
    setDirections([{ step: 1, instruction: '', duration: '', timeValue: '', timeUnit: 'minutes' }]);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Ingredient handlers
  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof IngredientForm, value: string) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  // Direction handlers
  const addDirection = () => {
    setDirections([
      ...directions,
      {
        step: directions.length + 1,
        instruction: '',
        duration: '',
        timeValue: '',
        timeUnit: 'minutes',
      },
    ]);
  };

  const removeDirection = (index: number) => {
    if (directions.length > 1) {
      const updated = directions.filter((_, i) => i !== index);
      // Renumber steps
      updated.forEach((dir, i) => {
        dir.step = i + 1;
      });
      setDirections(updated);
    }
  };

  const updateDirection = (index: number, field: keyof DirectionForm, value: string | number) => {
    const updated = [...directions];
    updated[index] = { ...updated[index], [field]: value };
    setDirections(updated);
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

    // Validate ingredients
    const validIngredients = ingredients.filter(
      ing => ing.name.trim() && ing.quantity.trim() && ing.unit.trim()
    );
    if (validIngredients.length === 0) {
      return 'At least one complete ingredient is required';
    }

    // Validate directions
    const validDirections = directions.filter(dir => dir.instruction.trim());
    if (validDirections.length === 0) {
      return 'At least one direction is required';
    }

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
      // Filter out empty ingredients and directions
      const validIngredients = ingredients
        .filter(ing => ing.name.trim() && ing.quantity.trim() && ing.unit.trim())
        .map(ing => ({
          name: ing.name.trim(),
          quantity: ing.quantity.trim(),
          unit: ing.unit.trim(),
        }));

      const validDirections = directions
        .filter(dir => dir.instruction.trim())
        .map((dir, index) => {
          const result: any = {
            step: index + 1,
            instruction: dir.instruction.trim(),
          };

          if (dir.timeValue && Number(dir.timeValue) > 0) {
            result.timeValue = Number(dir.timeValue);
            result.timeUnit = dir.timeUnit || 'minutes';
            // Format duration
            const value = Number(dir.timeValue);
            const unit = dir.timeUnit || 'minutes';
            result.duration =
              unit === 'days'
                ? `Day ${value}`
                : value === 1
                ? `${value} ${unit.slice(0, -1)}`
                : `${value} ${unit === 'minutes' ? 'mins' : unit}`;
          }

          return result;
        });

      const dataToSubmit = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        servingSize: Number(formData.servingSize),
        totalTimeValue: Number(formData.totalTimeValue),
        totalTimeUnit: formData.totalTimeUnit,
        notes: formData.notes.trim(),
        ingredients: validIngredients,
        directions: validDirections,
      };

      await createRecipe(dataToSubmit);
      setOpen(false);
      resetForm();
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Error creating recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
          <MdAdd className="h-5 w-5" />
          Add Recipe
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MdAdd className="h-5 w-5" />
            Add New Recipe
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new recipe.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-navy-700 dark:text-white">Basic Information</h3>

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

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the recipe"
                rows={2}
                className="w-full rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-2 text-sm text-navy-700 dark:text-white placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Main Course"
                  required
                />
              </div>

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
                    placeholder="45"
                    className="flex-1"
                    required
                  />
                  <select
                    name="totalTimeUnit"
                    value={formData.totalTimeUnit}
                    onChange={handleChange}
                    className="rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-2 py-2 text-sm text-navy-700 dark:text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="minutes">mins</option>
                    <option value="hours">hrs</option>
                    <option value="days">days</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-navy-700 dark:text-white">Ingredients</h3>
              <button
                type="button"
                onClick={addIngredient}
                className="text-sm text-brand-500 hover:text-brand-600 font-medium"
              >
                + Add Ingredient
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="Ingredient name"
                    value={ingredient.name}
                    onChange={e => updateIngredient(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Qty"
                    value={ingredient.quantity}
                    onChange={e => updateIngredient(index, 'quantity', e.target.value)}
                    className="w-20"
                  />
                  <Input
                    placeholder="Unit"
                    value={ingredient.unit}
                    onChange={e => updateIngredient(index, 'unit', e.target.value)}
                    className="w-24"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredients.length === 1}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <MdDelete className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Directions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-navy-700 dark:text-white">Directions</h3>
              <button
                type="button"
                onClick={addDirection}
                className="text-sm text-brand-500 hover:text-brand-600 font-medium"
              >
                + Add Step
              </button>
            </div>

            <div className="space-y-3">
              {directions.map((direction, index) => (
                <div key={index} className="space-y-2 p-3 rounded-lg border border-gray-200 dark:border-navy-600">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-navy-700 dark:text-white">
                      Step {direction.step}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDirection(index)}
                      disabled={directions.length === 1}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <MdDelete className="h-4 w-4" />
                    </button>
                  </div>

                  <textarea
                    placeholder="Enter instruction"
                    value={direction.instruction}
                    onChange={e => updateDirection(index, 'instruction', e.target.value)}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-2 text-sm text-navy-700 dark:text-white placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />

                  <div className="flex gap-2">
                    <Input
                      placeholder="Duration (optional)"
                      type="number"
                      min="1"
                      value={direction.timeValue}
                      onChange={e => updateDirection(index, 'timeValue', e.target.value)}
                      className="flex-1"
                    />
                    <select
                      value={direction.timeUnit}
                      onChange={e => updateDirection(index, 'timeUnit', e.target.value)}
                      className="rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-2 py-2 text-sm text-navy-700 dark:text-white focus:border-brand-500 focus:outline-none"
                    >
                      <option value="minutes">mins</option>
                      <option value="hours">hrs</option>
                      <option value="days">days</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any special notes, tips, or variations"
              rows={3}
              className="w-full rounded-md border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-2 text-sm text-navy-700 dark:text-white placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setOpen(false)}
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
                <>Creating...</>
              ) : (
                <>
                  <MdAdd className="h-4 w-4" />
                  Create Recipe
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecipeDialog;
