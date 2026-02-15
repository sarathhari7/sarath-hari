const admin = require('firebase-admin');
const db = admin.firestore();

// Get all recipes
const getAllRecipes = async (req, res) => {
  try {
    const userId = 'default-user'; // For now, using default user
    const recipesRef = db.collection('recipes').where('userId', '==', userId);
    const snapshot = await recipesRef.get();

    if (snapshot.empty) {
      return res.json({ success: true, data: [] });
    }

    const recipes = [];
    snapshot.forEach(doc => {
      recipes.push({ id: doc.id, ...doc.data() });
    });

    // Sort by createdAt descending
    recipes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: recipes });
  } catch (error) {
    console.error('Error getting recipes:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: 'DATABASE_ERROR',
      details: 'Failed to fetch recipes from database'
    });
  }
};

// Get recipe by ID
const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const recipeDoc = await db.collection('recipes').doc(id).get();

    if (!recipeDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Recipe not found',
        errorType: 'NOT_FOUND',
        details: `Recipe with ID ${id} does not exist`
      });
    }

    const recipe = { id: recipeDoc.id, ...recipeDoc.data() };
    res.json({ success: true, data: recipe });
  } catch (error) {
    console.error('Error getting recipe:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: 'DATABASE_ERROR',
      details: 'Failed to fetch recipe from database'
    });
  }
};

// Get favorite recipes
const getFavoriteRecipes = async (req, res) => {
  try {
    const userId = 'default-user';
    const recipesRef = db.collection('recipes')
      .where('userId', '==', userId)
      .where('isFavorite', '==', true);
    const snapshot = await recipesRef.get();

    if (snapshot.empty) {
      return res.json({ success: true, data: [] });
    }

    const recipes = [];
    snapshot.forEach(doc => {
      recipes.push({ id: doc.id, ...doc.data() });
    });

    recipes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: recipes });
  } catch (error) {
    console.error('Error getting favorite recipes:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: 'DATABASE_ERROR',
      details: 'Failed to fetch favorite recipes'
    });
  }
};

// Get recipes by category
const getRecipesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const userId = 'default-user';
    const recipesRef = db.collection('recipes')
      .where('userId', '==', userId)
      .where('category', '==', category);
    const snapshot = await recipesRef.get();

    if (snapshot.empty) {
      return res.json({ success: true, data: [] });
    }

    const recipes = [];
    snapshot.forEach(doc => {
      recipes.push({ id: doc.id, ...doc.data() });
    });

    recipes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: recipes });
  } catch (error) {
    console.error('Error getting recipes by category:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: 'DATABASE_ERROR',
      details: 'Failed to fetch recipes by category'
    });
  }
};

// Create recipe
const createRecipe = async (req, res) => {
  try {
    const userId = 'default-user';
    const recipeData = req.body;

    // Validate required fields
    if (!recipeData.title || !recipeData.category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        errorType: 'VALIDATION_ERROR',
        details: 'Title and category are required'
      });
    }

    const newRecipe = {
      ...recipeData,
      userId,
      isFavorite: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('recipes').add(newRecipe);
    const doc = await docRef.get();
    const recipe = { id: doc.id, ...doc.data() };

    // Update category count
    await updateCategoryCount(userId, recipeData.category);

    res.json({ success: true, data: recipe });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: 'DATABASE_ERROR',
      details: 'Failed to create recipe'
    });
  }
};

// Update recipe
const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const recipeRef = db.collection('recipes').doc(id);
    const recipeDoc = await recipeRef.get();

    if (!recipeDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Recipe not found',
        errorType: 'NOT_FOUND',
        details: `Recipe with ID ${id} does not exist`
      });
    }

    const oldData = recipeDoc.data();
    const oldCategory = oldData.category;
    const newCategory = updates.category;

    await recipeRef.update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedDoc = await recipeRef.get();
    const recipe = { id: updatedDoc.id, ...updatedDoc.data() };

    // Update category counts if category changed
    if (oldCategory && newCategory && oldCategory !== newCategory) {
      await updateCategoryCount(oldData.userId, oldCategory);
      await updateCategoryCount(oldData.userId, newCategory);
    }

    res.json({ success: true, data: recipe });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: 'DATABASE_ERROR',
      details: 'Failed to update recipe'
    });
  }
};

// Delete recipe
const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const recipeRef = db.collection('recipes').doc(id);
    const recipeDoc = await recipeRef.get();

    if (!recipeDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Recipe not found',
        errorType: 'NOT_FOUND',
        details: `Recipe with ID ${id} does not exist`
      });
    }

    const recipeData = recipeDoc.data();
    await recipeRef.delete();

    // Update category count
    await updateCategoryCount(recipeData.userId, recipeData.category);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: 'DATABASE_ERROR',
      details: 'Failed to delete recipe'
    });
  }
};

// Toggle favorite
const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    const recipeRef = db.collection('recipes').doc(id);
    const recipeDoc = await recipeRef.get();

    if (!recipeDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Recipe not found',
        errorType: 'NOT_FOUND',
        details: `Recipe with ID ${id} does not exist`
      });
    }

    const currentData = recipeDoc.data();
    const newFavoriteStatus = !currentData.isFavorite;

    await recipeRef.update({
      isFavorite: newFavoriteStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedDoc = await recipeRef.get();
    const recipe = { id: updatedDoc.id, ...updatedDoc.data() };

    res.json({ success: true, data: recipe });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: 'DATABASE_ERROR',
      details: 'Failed to toggle favorite status'
    });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const userId = 'default-user';
    const categoriesRef = db.collection('categories').where('userId', '==', userId);
    const snapshot = await categoriesRef.get();

    if (snapshot.empty) {
      return res.json({ success: true, data: [] });
    }

    const categories = [];
    snapshot.forEach(doc => {
      categories.push({ id: doc.id, ...doc.data() });
    });

    // Sort by name
    categories.sort((a, b) => a.name.localeCompare(b.name));

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: 'DATABASE_ERROR',
      details: 'Failed to fetch categories'
    });
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const userId = 'default-user';
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        errorType: 'VALIDATION_ERROR',
        details: 'Category name is required'
      });
    }

    const newCategory = {
      name,
      description: description || '',
      count: 0,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('categories').add(newCategory);
    const doc = await docRef.get();
    const category = { id: doc.id, ...doc.data() };

    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: 'DATABASE_ERROR',
      details: 'Failed to create category'
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = 'default-user';

    const categoryRef = db.collection('categories').doc(id);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
        errorType: 'NOT_FOUND',
        details: `Category with ID ${id} does not exist`
      });
    }

    const oldData = categoryDoc.data();
    const oldName = oldData.name;

    await categoryRef.update({
      name,
      description: description || '',
    });

    // Update all recipes with this category
    if (oldName !== name) {
      const recipesRef = db.collection('recipes')
        .where('userId', '==', userId)
        .where('category', '==', oldName);
      const snapshot = await recipesRef.get();

      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.update(doc.ref, { category: name });
      });
      await batch.commit();
    }

    const updatedDoc = await categoryRef.get();
    const category = { id: updatedDoc.id, ...updatedDoc.data() };

    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: 'DATABASE_ERROR',
      details: 'Failed to update category'
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = 'default-user';

    const categoryRef = db.collection('categories').doc(id);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
        errorType: 'NOT_FOUND',
        details: `Category with ID ${id} does not exist`
      });
    }

    const categoryData = categoryDoc.data();
    const categoryName = categoryData.name;

    // Move recipes to "Other" category
    const recipesRef = db.collection('recipes')
      .where('userId', '==', userId)
      .where('category', '==', categoryName);
    const snapshot = await recipesRef.get();

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, { category: 'Other' });
    });
    await batch.commit();

    // Delete the category
    await categoryRef.delete();

    // Update "Other" category count
    await updateCategoryCount(userId, 'Other');

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: 'DATABASE_ERROR',
      details: 'Failed to delete category'
    });
  }
};

// Helper function to update category count
const updateCategoryCount = async (userId, categoryName) => {
  try {
    const recipesRef = db.collection('recipes')
      .where('userId', '==', userId)
      .where('category', '==', categoryName);
    const snapshot = await recipesRef.get();
    const count = snapshot.size;

    // Find or create category
    const categoriesRef = db.collection('categories')
      .where('userId', '==', userId)
      .where('name', '==', categoryName);
    const categorySnapshot = await categoriesRef.get();

    if (categorySnapshot.empty) {
      // Create new category
      await db.collection('categories').add({
        name: categoryName,
        description: '',
        count,
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Update existing category
      const categoryDoc = categorySnapshot.docs[0];
      await categoryDoc.ref.update({ count });
    }
  } catch (error) {
    console.error('Error updating category count:', error);
  }
};

module.exports = {
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
};
