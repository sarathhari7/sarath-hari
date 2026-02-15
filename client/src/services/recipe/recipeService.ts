import { Recipe, Category, RecipeFormData } from './types';
import apiCall from '../api';

// Recipe CRUD operations
export const getAllRecipes = async (): Promise<Recipe[]> => {
  const response = await apiCall<Recipe[]>('/api/recipe/recipes', {
    showErrorToast: true,
    errorMessage: 'Failed to load recipes',
  });
  return response.data || [];
};

export const getRecipeById = async (id: string): Promise<Recipe | null> => {
  const response = await apiCall<Recipe>(`/api/recipe/recipes/${id}`, {
    showErrorToast: true,
    errorMessage: 'Failed to load recipe',
  });
  return response.data || null;
};

export const getFavoriteRecipes = async (): Promise<Recipe[]> => {
  const response = await apiCall<Recipe[]>('/api/recipe/recipes/favorites', {
    showErrorToast: true,
    errorMessage: 'Failed to load favorite recipes',
  });
  return response.data || [];
};

export const getRecipesByCategory = async (category: string): Promise<Recipe[]> => {
  const response = await apiCall<Recipe[]>(`/api/recipe/recipes/category/${encodeURIComponent(category)}`, {
    showErrorToast: true,
    errorMessage: 'Failed to load recipes by category',
  });
  return response.data || [];
};

export const createRecipe = async (data: RecipeFormData): Promise<Recipe> => {
  const response = await apiCall<Recipe>('/api/recipe/recipes', {
    method: 'POST',
    body: JSON.stringify(data),
    showSuccessToast: true,
    successMessage: 'Recipe created successfully',
    showErrorToast: true,
    errorMessage: 'Failed to create recipe',
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to create recipe');
  }

  return response.data;
};

export const updateRecipe = async (id: string, data: Partial<RecipeFormData>): Promise<Recipe> => {
  const response = await apiCall<Recipe>(`/api/recipe/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    showSuccessToast: true,
    successMessage: 'Recipe updated successfully',
    showErrorToast: true,
    errorMessage: 'Failed to update recipe',
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to update recipe');
  }

  return response.data;
};

export const deleteRecipe = async (id: string): Promise<void> => {
  const response = await apiCall<void>(`/api/recipe/recipes/${id}`, {
    method: 'DELETE',
    showSuccessToast: true,
    successMessage: 'Recipe deleted successfully',
    showErrorToast: true,
    errorMessage: 'Failed to delete recipe',
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to delete recipe');
  }
};

export const toggleFavorite = async (id: string): Promise<Recipe> => {
  const response = await apiCall<Recipe>(`/api/recipe/recipes/${id}/favorite`, {
    method: 'PUT',
    showErrorToast: true,
    errorMessage: 'Failed to toggle favorite status',
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to toggle favorite');
  }

  return response.data;
};

// Category operations
export const getAllCategories = async (): Promise<Category[]> => {
  const response = await apiCall<Category[]>('/api/recipe/categories', {
    showErrorToast: true,
    errorMessage: 'Failed to load categories',
  });
  return response.data || [];
};

export const createCategory = async (name: string, description?: string): Promise<Category> => {
  const response = await apiCall<Category>('/api/recipe/categories', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
    showSuccessToast: true,
    successMessage: 'Category created successfully',
    showErrorToast: true,
    errorMessage: 'Failed to create category',
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to create category');
  }

  return response.data;
};

export const updateCategory = async (id: string, name: string, description?: string): Promise<Category> => {
  const response = await apiCall<Category>(`/api/recipe/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, description }),
    showSuccessToast: true,
    successMessage: 'Category updated successfully',
    showErrorToast: true,
    errorMessage: 'Failed to update category',
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to update category');
  }

  return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const response = await apiCall<void>(`/api/recipe/categories/${id}`, {
    method: 'DELETE',
    showSuccessToast: true,
    successMessage: 'Category deleted successfully',
    showErrorToast: true,
    errorMessage: 'Failed to delete category',
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to delete category');
  }
};
