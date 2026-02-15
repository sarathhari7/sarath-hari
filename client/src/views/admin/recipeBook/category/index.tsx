import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdCategory } from 'react-icons/md';
import RecipeCard from '../components/RecipeCard';
import EditRecipeDialogFull from '../components/EditRecipeDialogFull';
import { Recipe, getRecipesByCategory } from 'services/recipe';
import { RecipeProvider, useRecipe } from '../contexts/RecipeContext';
import { showErrorToast } from 'utils/toast';

const CategoryViewContent = () => {
  const navigate = useNavigate();
  const { categoryName } = useParams<{ categoryName: string }>();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
  const { refreshTrigger } = useRecipe();

  const fetchCategoryRecipes = useCallback(async () => {
    if (!categoryName) return;

    setLoading(true);
    try {
      const data = await getRecipesByCategory(categoryName);
      setRecipes(data);
    } catch (error) {
      showErrorToast('Failed to load category recipes');
      console.error('Error fetching category recipes:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  useEffect(() => {
    fetchCategoryRecipes();
  }, [categoryName, refreshTrigger, fetchCategoryRecipes]);

  const handleEdit = (recipe: Recipe) => {
    setRecipeToEdit(recipe);
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    fetchCategoryRecipes();
  };

  const handleEditSuccess = () => {
    fetchCategoryRecipes();
  };

  return (
    <div className="mt-3">
      {/* Recipe Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading recipes...</div>
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <MdCategory className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            No recipes in this category
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            Add recipes to see them here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onFavoriteToggle={fetchCategoryRecipes}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <EditRecipeDialogFull
        recipe={recipeToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

const CategoryView = () => {
  return (
    <RecipeProvider>
      <CategoryViewContent />
    </RecipeProvider>
  );
};

export default CategoryView;
