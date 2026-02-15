import apiCall, { ApiResponse } from '../api';

// Notification data types
export interface NotificationData {
  id: string;
  title: string;
  dueDate: Date | string;
  priority: 'high' | 'medium' | 'low';
  repeatType: 'none' | 'monthly';
  sourceType: 'budget' | 'todo' | 'recipe';
  sourceId: string;
  category: 'budget' | 'todo' | 'recipe'; // Category for filtering and display
  userId: string;
  monthKey: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Notification data API endpoints
const ENDPOINTS = {
  getAll: '/api/notification-data',
  getUpcoming: '/api/notification-data/upcoming',
};

// Get all notifications for a user
export const getAllNotificationData = async (): Promise<ApiResponse<NotificationData[]>> => {
  return apiCall<NotificationData[]>(ENDPOINTS.getAll, {
    showErrorToast: true,
    errorMessage: 'Failed to fetch notifications',
  });
};

// Get upcoming notifications (next 7 days)
export const getUpcomingNotificationData = async (): Promise<ApiResponse<NotificationData[]>> => {
  return apiCall<NotificationData[]>(ENDPOINTS.getUpcoming, {
    showErrorToast: false,
  });
};
