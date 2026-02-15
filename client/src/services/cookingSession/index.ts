import apiCall from '../api';

export interface CookingSession {
  recipeId: string;
  userId: string;
  isPlaying: boolean;
  isPaused: boolean;
  startTime: string | null;
  pauseTime: string | null;
  totalPauseDuration: number;
  checkedSteps: number[];
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const getCookingSession = async (recipeId: string): Promise<ApiResponse<CookingSession | null>> => {
  return apiCall<CookingSession | null>(`/api/cooking-session/${recipeId}`, {
    showErrorToast: false, // Don't show error if session doesn't exist
  });
};

export const saveCookingSession = async (
  recipeId: string,
  sessionData: Partial<CookingSession>
): Promise<ApiResponse<CookingSession>> => {
  return apiCall<CookingSession>(`/api/cooking-session/${recipeId}`, {
    method: 'POST',
    body: JSON.stringify(sessionData),
    showSuccessToast: false, // Auto-save should be silent
    showErrorToast: false, // Don't spam user with errors
  });
};

export const deleteCookingSession = async (recipeId: string): Promise<ApiResponse<void>> => {
  return apiCall<void>(`/api/cooking-session/${recipeId}`, {
    method: 'DELETE',
    showSuccessToast: false, // Silent deletion
    showErrorToast: false,
  });
};
