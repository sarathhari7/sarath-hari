import apiCall, { ApiResponse } from '../api';

// Event data types
export interface EventData {
  id: string;
  title: string;
  date: Date | string;
  repeatType: 'none' | 'monthly';
  priority: 'high' | 'medium' | 'low';
  sourceType: 'budget' | 'todo' | 'recipe';
  sourceId: string;
  category: 'budget' | 'todo' | 'recipe'; // Category for filtering and display
  userId: string;
  monthKey: string | null;
  description: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Event data API endpoints
const ENDPOINTS = {
  getAll: '/api/event-data',
  getByMonth: (year: number, month: number) => `/api/event-data/month/${year}/${month}`,
};

// Get all events for a user
export const getAllEventData = async (): Promise<ApiResponse<EventData[]>> => {
  return apiCall<EventData[]>(ENDPOINTS.getAll, {
    showErrorToast: true,
    errorMessage: 'Failed to fetch events',
  });
};

// Get events for a specific month
export const getEventsByMonth = async (year: number, month: number): Promise<ApiResponse<EventData[]>> => {
  return apiCall<EventData[]>(ENDPOINTS.getByMonth(year, month), {
    showErrorToast: true,
    errorMessage: 'Failed to fetch events for the selected month',
  });
};
