import apiCall, { ApiResponse } from '../api';

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}

// Notification API endpoints
const ENDPOINTS = {
  getAll: '/api/notifications',
  getUnreadCount: '/api/notifications/unread-count',
  create: '/api/notifications',
  markAsRead: (id: string) => `/api/notifications/${id}/read`,
  markAllAsRead: '/api/notifications/read-all',
  delete: (id: string) => `/api/notifications/${id}`,
  deleteAllRead: '/api/notifications/read-all',
};

// Get all notifications
export const getAllNotifications = async (): Promise<ApiResponse<Notification[]>> => {
  return apiCall<Notification[]>(ENDPOINTS.getAll, {
    showErrorToast: true,
    errorMessage: 'Failed to fetch notifications',
  });
};

// Get unread notifications count
export const getUnreadCount = async (): Promise<ApiResponse<{ count: number }>> => {
  return apiCall<{ count: number }>(ENDPOINTS.getUnreadCount, {
    showErrorToast: false,
  });
};

// Create new notification
export const createNotification = async (
  data: CreateNotificationRequest
): Promise<ApiResponse<Notification>> => {
  return apiCall<Notification>(ENDPOINTS.create, {
    method: 'POST',
    body: JSON.stringify(data),
    showSuccessToast: true,
    successMessage: 'Notification created successfully',
    errorMessage: 'Failed to create notification',
  });
};

// Mark notification as read
export const markNotificationAsRead = async (
  id: string
): Promise<ApiResponse<Notification>> => {
  return apiCall<Notification>(ENDPOINTS.markAsRead(id), {
    method: 'PUT',
    showSuccessToast: false,
    errorMessage: 'Failed to mark notification as read',
  });
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<ApiResponse<{ message: string }>> => {
  return apiCall<{ message: string }>(ENDPOINTS.markAllAsRead, {
    method: 'PUT',
    showSuccessToast: true,
    successMessage: 'All notifications marked as read',
    errorMessage: 'Failed to mark all as read',
  });
};

// Delete notification
export const deleteNotification = async (id: string): Promise<ApiResponse<void>> => {
  return apiCall<void>(ENDPOINTS.delete(id), {
    method: 'DELETE',
    showSuccessToast: true,
    successMessage: 'Notification deleted successfully',
    errorMessage: 'Failed to delete notification',
  });
};

// Delete all read notifications
export const deleteAllReadNotifications = async (): Promise<ApiResponse<{ message: string }>> => {
  return apiCall<{ message: string }>(ENDPOINTS.deleteAllRead, {
    method: 'DELETE',
    showSuccessToast: true,
    successMessage: 'All read notifications deleted',
    errorMessage: 'Failed to delete read notifications',
  });
};
