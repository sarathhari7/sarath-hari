const express = require('express');
const router = express.Router();
const {
  getAllRecipes,
  getRecipeById,
  getFavoriteRecipes,
  getRecipesByCategory,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  toggleFavorite,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/recipeController');

// Recipe routes
router.get('/recipes', getAllRecipes);
router.get('/recipes/favorites', getFavoriteRecipes);
router.get('/recipes/category/:category', getRecipesByCategory);
router.get('/recipes/:id', getRecipeById);
router.post('/recipes', createRecipe);
router.put('/recipes/:id', updateRecipe);
router.delete('/recipes/:id', deleteRecipe);
router.put('/recipes/:id/favorite', toggleFavorite);

// Category routes
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
