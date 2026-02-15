import { Routes, Route, Navigate } from 'react-router-dom';
import AllRecipes from './all';
import Favorites from './favorites';
import CategoryView from './category';
import RecipeDetail from './detail';

const RecipeBook = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="all" replace />} />
      <Route path="all" element={<AllRecipes />} />
      <Route path="favorites" element={<Favorites />} />
      <Route path="category/:categoryName" element={<CategoryView />} />
      <Route path=":recipeId" element={<RecipeDetail />} />
    </Routes>
  );
};

export default RecipeBook;
