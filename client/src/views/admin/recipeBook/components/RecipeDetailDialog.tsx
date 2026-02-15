import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from 'components/ui/dialog';
import { Recipe } from 'services/recipe';
import { MdAccessTime, MdPeople, MdRestaurant } from 'react-icons/md';
import { IoHeart, IoHeartOutline } from 'react-icons/io5';
import { toggleFavorite } from 'services/recipe';
import { showSuccessToast, showErrorToast } from 'utils/toast';

interface RecipeDetailDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

const RecipeDetailDialog: React.FC<RecipeDetailDialogProps> = ({
  recipe,
  open,
  onOpenChange,
  onUpdate,
}) => {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());

  if (!recipe) return null;

  const handleFavoriteClick = async () => {
    try {
      await toggleFavorite(recipe.id);
      showSuccessToast(
        recipe.isFavorite ? 'Removed from favorites' : 'Added to favorites'
      );
      if (onUpdate) onUpdate();
    } catch (error) {
      showErrorToast('Failed to update favorite status');
    }
  };

  const toggleIngredient = (id: string) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedIngredients(newChecked);
  };

  const toggleStep = (id: string) => {
    const newChecked = new Set(checkedSteps);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedSteps(newChecked);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{recipe.title}</DialogTitle>
              <DialogDescription className="mt-2">
                {recipe.description}
              </DialogDescription>
              <span className="mt-2 inline-block rounded-md bg-brand-100 dark:bg-brand-900/30 px-3 py-1 text-sm font-medium text-brand-700 dark:text-brand-300">
                {recipe.category}
              </span>
            </div>
            <button
              onClick={handleFavoriteClick}
              className="flex items-center justify-center rounded-md bg-white dark:bg-navy-700 p-2 text-brand-500 hover:cursor-pointer border border-gray-200 dark:border-navy-600"
            >
              {recipe.isFavorite ? (
                <IoHeart className="h-6 w-6 text-red-500" />
              ) : (
                <IoHeartOutline className="h-6 w-6 text-gray-400" />
              )}
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Summary Section */}
          <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 dark:bg-navy-800 p-4">
            <div className="flex items-center gap-2">
              <MdRestaurant className="h-5 w-5 text-brand-500" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Ingredients</p>
                <p className="text-lg font-semibold text-navy-700 dark:text-white">
                  {recipe.ingredients.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MdAccessTime className="h-5 w-5 text-brand-500" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Time</p>
                <p className="text-lg font-semibold text-navy-700 dark:text-white">
                  {recipe.totalTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MdPeople className="h-5 w-5 text-brand-500" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Serving Size</p>
                <p className="text-lg font-semibold text-navy-700 dark:text-white">
                  {recipe.servingSize}
                </p>
              </div>
            </div>
          </div>

          {/* Ingredients List */}
          <div>
            <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
              Ingredients
            </h3>
            <div className="space-y-2">
              {recipe.ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors"
                >
                  <input
                    type="checkbox"
                    id={`ingredient-${ingredient.id}`}
                    checked={checkedIngredients.has(ingredient.id)}
                    onChange={() => toggleIngredient(ingredient.id)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  />
                  <label
                    htmlFor={`ingredient-${ingredient.id}`}
                    className={`flex-1 cursor-pointer text-sm ${
                      checkedIngredients.has(ingredient.id)
                        ? 'line-through text-gray-400'
                        : 'text-navy-700 dark:text-white'
                    }`}
                  >
                    <span className="font-medium">{ingredient.quantity} {ingredient.unit}</span>{' '}
                    {ingredient.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Directions Timeline */}
          <div>
            <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
              Directions
            </h3>
            <div className="space-y-4">
              {recipe.directions.map((direction, index) => (
                <div key={direction.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <input
                      type="checkbox"
                      id={`step-${direction.id}`}
                      checked={checkedSteps.has(direction.id)}
                      onChange={() => toggleStep(direction.id)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                    />
                    {index < recipe.directions.length - 1 && (
                      <div className="w-px h-full bg-gray-300 dark:bg-navy-600 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-bold">
                        {direction.step}
                      </span>
                      {direction.duration && (
                        <span className="text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded">
                          {direction.duration}
                        </span>
                      )}
                    </div>
                    <label
                      htmlFor={`step-${direction.id}`}
                      className={`cursor-pointer text-sm ${
                        checkedSteps.has(direction.id)
                          ? 'line-through text-gray-400'
                          : 'text-navy-700 dark:text-white'
                      }`}
                    >
                      {direction.instruction}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDetailDialog;
