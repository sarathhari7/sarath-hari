// Recipe Book Constants

import { TimeUnit } from './types';

// Time unit options
export const TIME_UNITS: TimeUnit[] = ['minutes', 'hours', 'days'];

// Time unit labels
export const TIME_UNIT_LABELS: Record<TimeUnit, { singular: string; plural: string }> = {
  minutes: { singular: 'min', plural: 'mins' },
  hours: { singular: 'hour', plural: 'hours' },
  days: { singular: 'day', plural: 'days' },
};

// Common measurement units
export const MEASUREMENT_UNITS = [
  'cup',
  'cups',
  'tbsp',
  'tsp',
  'oz',
  'lb',
  'g',
  'kg',
  'ml',
  'l',
  'piece',
  'pieces',
  'pinch',
  'to taste',
] as const;

// Default categories (can be extended by user)
export const DEFAULT_CATEGORIES = [
  'Appetizers',
  'Main Course',
  'Desserts',
  'Beverages',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snacks',
  'Fermented Foods',
  'Baking',
  'Soups & Stews',
  'Salads',
  'Vegetarian',
  'Vegan',
  'Other',
] as const;

// Helper function to format time
export const formatTime = (value: number, unit: TimeUnit): string => {
  const label = value === 1
    ? TIME_UNIT_LABELS[unit].singular
    : TIME_UNIT_LABELS[unit].plural;
  return `${value} ${label}`;
};

// Helper function to format direction time (with day prefix for day-based)
export const formatDirectionTime = (step: number, value: number | undefined, unit: TimeUnit | undefined): string => {
  if (!value || !unit) return '';

  if (unit === 'days') {
    return `Day ${value}`;
  }

  return formatTime(value, unit);
};

// Validation rules
export const VALIDATION = {
  title: {
    minLength: 3,
    maxLength: 100,
  },
  description: {
    maxLength: 500,
  },
  servingSize: {
    min: 1,
    max: 100,
  },
  totalTime: {
    min: 1,
  },
};
