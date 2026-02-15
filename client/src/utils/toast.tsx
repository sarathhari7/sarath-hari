import { toast } from 'sonner';
import { ApiResponse } from '../services/api';

/**
 * Toast utility for displaying API response notifications
 * Automatically formats error messages with type and details
 */

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

/**
 * Format error details for display
 */
const formatErrorDetails = (errorType?: string, details?: string): string | null => {
  if (!errorType && !details) return null;

  const parts: string[] = [];
  if (errorType) parts.push(`Type: ${errorType}`);
  if (details) parts.push(`Details: ${details}`);

  return parts.join(' • ');
};

/**
 * Show success toast
 */
export const showSuccessToast = (message: string, options?: ToastOptions) => {
  toast.success(message, {
    duration: options?.duration || 4000,
    position: options?.position || 'top-right',
  });
};

/**
 * Show error toast with formatted details
 */
export const showErrorToast = (
  message: string,
  errorType?: string,
  details?: string,
  options?: ToastOptions
) => {
  const description = formatErrorDetails(errorType, details);

  toast.error(message, {
    description,
    duration: options?.duration || 6000,
    position: options?.position || 'top-right',
  });
};

/**
 * Show warning toast with formatted details
 */
export const showWarningToast = (
  message: string,
  details?: string,
  options?: ToastOptions
) => {
  toast.warning(message, {
    description: details || undefined,
    duration: options?.duration || 5000,
    position: options?.position || 'top-right',
  });
};

/**
 * Show info toast
 */
export const showInfoToast = (message: string, options?: ToastOptions) => {
  toast.info(message, {
    duration: options?.duration || 4000,
    position: options?.position || 'top-right',
  });
};

/**
 * Show loading toast (returns ID to dismiss later)
 */
export const showLoadingToast = (message: string, options?: ToastOptions) => {
  return toast.loading(message, {
    duration: Infinity,
    position: options?.position || 'top-right',
  });
};

/**
 * Dismiss a specific toast by ID
 */
export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

/**
 * Automatically handle API response and show appropriate toast
 * Returns true if the response was successful, false otherwise
 */
export const handleApiResponse = <T,>(
  response: ApiResponse<T>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    showSuccess?: boolean;
    toastOptions?: ToastOptions;
  }
): boolean => {
  const {
    successMessage,
    errorMessage,
    showSuccess = true,
    toastOptions,
  } = options || {};

  if (response.success) {
    if (showSuccess && successMessage) {
      showSuccessToast(successMessage, toastOptions);
    }
    return true;
  } else {
    const message = errorMessage || response.error || 'An error occurred';
    showErrorToast(
      message,
      response.errorType,
      response.details,
      toastOptions
    );
    return false;
  }
};

/**
 * Promise toast - shows loading, then success or error based on promise result
 */
export const showPromiseToast = async <T,>(
  promise: Promise<ApiResponse<T>>,
  messages: {
    loading: string;
    success: string;
    error?: string;
  },
  options?: ToastOptions
): Promise<ApiResponse<T>> => {
  const toastId = showLoadingToast(messages.loading, options);

  try {
    const response = await promise;
    dismissToast(toastId);

    if (response.success) {
      showSuccessToast(messages.success, options);
    } else {
      showErrorToast(
        messages.error || response.error || 'Operation failed',
        response.errorType,
        response.details,
        options
      );
    }

    return response;
  } catch (error) {
    dismissToast(toastId);
    showErrorToast(
      messages.error || 'An unexpected error occurred',
      'NETWORK_ERROR',
      error instanceof Error ? error.message : String(error),
      options
    );
    throw error;
  }
};
