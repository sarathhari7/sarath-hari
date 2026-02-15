import { useState, useEffect } from 'react';
import { MdSearch, MdRestaurant } from 'react-icons/md';
import RecipeCard from '../components/RecipeCard';
import AddRecipeDialog from '../components/AddRecipeDialog';
import EditRecipeDialogFull from '../components/EditRecipeDialogFull';
import { Recipe, getAllRecipes } from 'services/recipe';
import { RecipeProvider, useRecipe } from '../contexts/RecipeContext';
import { showErrorToast } from 'utils/toast';
import { useNavigate } from 'react-router-dom';

const AllRecipesContent = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
  const { refreshTrigger } = useRecipe();

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const data = await getAllRecipes();
      setRecipes(data);
      setFilteredRecipes(data);
    } catch (error) {
      showErrorToast('Failed to load recipes');
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [refreshTrigger]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRecipes(recipes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = recipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(query) ||
          recipe.description.toLowerCase().includes(query) ||
          recipe.category.toLowerCase().includes(query)
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, recipes]);

  const handleEdit = (recipe: Recipe) => {
    setRecipeToEdit(recipe);
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    fetchRecipes();
  };

  const handleEditSuccess = () => {
    fetchRecipes();
  };

  return (
    <div className="mt-3">
      {/* Header with Add Recipe Button */}
      <div className="mb-5 flex items-center justify-end">
        <AddRecipeDialog onSuccess={fetchRecipes} />
      </div>

      {/* Search Bar */}
      <div className="mb-5">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search recipes by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 pl-10 pr-4 py-2.5 text-sm text-navy-700 dark:text-white placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* Recipe Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading recipes...</div>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <MdRestaurant className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            {searchQuery ? 'No recipes found matching your search' : 'No recipes yet'}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            {searchQuery ? 'Try different keywords' : 'Start by adding your first recipe'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onFavoriteToggle={fetchRecipes}
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

const AllRecipes = () => {
  return (
    <RecipeProvider>
      <AllRecipesContent />
    </RecipeProvider>
  );
};

export default AllRecipes;
