// Recipe Book Type Definitions

export type TimeUnit = 'minutes' | 'hours' | 'days';

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

export interface Direction {
  id: string;
  step: number;
  instruction: string;
  duration?: string; // Display format: "20 mins", "1 hour", "Day 1"
  timeValue?: number;
  timeUnit?: TimeUnit;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: string;
  ingredients: Ingredient[];
  directions: Direction[];
  servingSize: number;
  totalTime: string; // Display format: "45 mins", "2 hours", "3 days"
  totalTimeValue: number;
  totalTimeUnit: TimeUnit;
  isFavorite: boolean;
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  count: number; // number of recipes in this category
  createdAt: string;
}

export interface RecipeFormData {
  title: string;
  description: string;
  category: string;
  ingredients: Omit<Ingredient, 'id'>[];
  directions: Omit<Direction, 'id'>[];
  servingSize: number;
  totalTimeValue: number;
  totalTimeUnit: TimeUnit;
  notes?: string;
  imageUrl?: string;
}
