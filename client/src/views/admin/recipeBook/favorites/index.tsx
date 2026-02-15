import { useState, useEffect } from 'react';
import { MdFavorite } from 'react-icons/md';
import RecipeCard from '../components/RecipeCard';
import EditRecipeDialogFull from '../components/EditRecipeDialogFull';
import { Recipe, getFavoriteRecipes } from 'services/recipe';
import { RecipeProvider, useRecipe } from '../contexts/RecipeContext';
import { showErrorToast } from 'utils/toast';
import { useNavigate } from 'react-router-dom';

const FavoritesContent = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
  const { refreshTrigger } = useRecipe();

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const data = await getFavoriteRecipes();
      setRecipes(data);
    } catch (error) {
      showErrorToast('Failed to load favorite recipes');
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [refreshTrigger]);

  const handleEdit = (recipe: Recipe) => {
    setRecipeToEdit(recipe);
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    fetchFavorites();
  };

  const handleEditSuccess = () => {
    fetchFavorites();
  };

  return (
    <div className="mt-3">
      {/* Recipe Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading favorites...</div>
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <MdFavorite className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            No favorite recipes yet
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            Mark recipes as favorites by clicking the heart icon
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onFavoriteToggle={fetchFavorites}
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

const Favorites = () => {
  return (
    <RecipeProvider>
      <FavoritesContent />
    </RecipeProvider>
  );
};

export default Favorites;
