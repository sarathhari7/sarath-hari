import { useNavigate } from 'react-router-dom';
import { IoHeart, IoHeartOutline } from 'react-icons/io5';
import { MdAccessTime, MdPeople, MdRestaurant, MdEdit, MdDelete } from 'react-icons/md';
import Card from 'components/card';
import { Badge } from 'components/ui/badge';
import { Recipe } from 'services/recipe';
import { toggleFavorite, deleteRecipe } from 'services/recipe';
import { showSuccessToast, showErrorToast } from 'utils/toast';

interface RecipeCardProps {
  recipe: Recipe;
  onFavoriteToggle?: () => void;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onFavoriteToggle, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite(recipe.id);
      showSuccessToast(
        recipe.isFavorite ? 'Removed from favorites' : 'Added to favorites'
      );
      if (onFavoriteToggle) onFavoriteToggle();
    } catch (error) {
      showErrorToast('Failed to update favorite status');
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(recipe);
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${recipe.title}"?`)) {
      try {
        await deleteRecipe(recipe.id);
        showSuccessToast('Recipe deleted successfully');
        if (onDelete) onDelete();
      } catch (error) {
        showErrorToast('Failed to delete recipe');
      }
    }
  };

  return (
    <Card extra="flex flex-col w-full h-full !p-4 bg-white dark:bg-navy-800">
      <div className="h-full w-full flex flex-col gap-[5px]">
        {/* Title and Category */}
        <div className="flex items-start justify-between gap-2 px-1">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white line-clamp-2 flex-1">
            {recipe.title}
          </h3>
          <Badge>{recipe.category}</Badge>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between px-1 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <MdRestaurant className="h-4 w-4" />
            <span>{recipe.ingredients.length} ingredients</span>
          </div>
          <div className="flex items-center gap-1">
            <MdAccessTime className="h-4 w-4" />
            <span>{recipe.totalTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <MdPeople className="h-4 w-4" />
            <span>{recipe.servingSize}</span>
          </div>
        </div>

        {/* Spacer to push buttons to bottom */}
        <div className="flex-grow"></div>

        {/* View Button and Action Buttons */}
        <div className="flex items-center justify-between gap-2 mt-[5px]">
          <button
            onClick={() => navigate(`/admin/recipe-book/${recipe.id}`)}
            className="linear flex-1 rounded-md bg-brand-500 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
          >
            View
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEditClick}
              className="flex items-center justify-center rounded-md bg-gray-100 dark:bg-navy-700 p-2 hover:bg-gray-200 dark:hover:bg-navy-600 transition-colors"
            >
              <MdEdit className="h-5 w-5 text-blue-500" />
            </button>

            <button
              onClick={handleDeleteClick}
              className="flex items-center justify-center rounded-md bg-gray-100 dark:bg-navy-700 p-2 hover:bg-gray-200 dark:hover:bg-navy-600 transition-colors"
            >
              <MdDelete className="h-5 w-5 text-red-500" />
            </button>

            <button
              onClick={handleFavoriteClick}
              className="flex items-center justify-center rounded-md bg-gray-100 dark:bg-navy-700 p-2 hover:bg-gray-200 dark:hover:bg-navy-600 transition-colors"
            >
              {recipe.isFavorite ? (
                <IoHeart className="h-5 w-5 text-red-500" />
              ) : (
                <IoHeartOutline className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RecipeCard;
