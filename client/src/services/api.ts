import { showErrorToast, showSuccessToast } from '../utils/toast';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorType?: 'VALIDATION_ERROR' | 'DATABASE_ERROR' | 'NOT_FOUND' | 'NETWORK_ERROR';
  details?: string;
  timestamp?: string;
  message?: string;
}

// Extended options for API calls with toast configuration
export interface ApiCallOptions extends RequestInit {
  showErrorToast?: boolean;  // Default: true
  showSuccessToast?: boolean; // Default: false (to avoid spamming on GET requests)
  successMessage?: string;
  errorMessage?: string;
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options?: ApiCallOptions
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options?.method || 'GET';

  // Extract toast options (default: show errors, don't show success for GET)
  const {
    showErrorToast: shouldShowError = true,
    showSuccessToast: shouldShowSuccess = method !== 'GET',
    successMessage,
    errorMessage,
    ...fetchOptions
  } = options || {};

  try {
    console.log(`[API] ${method} ${endpoint}`);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions?.headers,
      },
      ...fetchOptions,
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    let data: any;

    if (isJson) {
      data = await response.json();
    } else {
      // Handle non-JSON responses (like HTML error pages)
      const text = await response.text();
      data = {
        error: response.status === 404
          ? 'API endpoint not found. Is the server running?'
          : `Server returned ${response.status}: ${response.statusText}`,
        errorType: response.status === 404 ? 'NOT_FOUND' : 'SERVER_ERROR',
        details: text.length > 200 ? text.substring(0, 200) + '...' : text,
      };
    }

    if (!response.ok) {
      // Log detailed error information
      console.error(`[API Error] ${method} ${endpoint}`, {
        status: response.status,
        statusText: response.statusText,
        errorType: data.errorType,
        error: data.error,
        details: data.details,
        timestamp: data.timestamp,
        url,
      });

      const apiResponse: ApiResponse<T> = {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`,
        errorType: data.errorType || 'SERVER_ERROR',
        details: data.details,
        timestamp: data.timestamp || new Date().toISOString(),
      };

      // Show error toast if enabled
      if (shouldShowError) {
        showErrorToast(
          errorMessage || apiResponse.error || 'Request failed',
          apiResponse.errorType,
          apiResponse.details
        );
      }

      return apiResponse;
    }

    console.log(`[API Success] ${method} ${endpoint}`);

    // Show success toast if enabled
    if (shouldShowSuccess) {
      const message = successMessage || data.message || getDefaultSuccessMessage(method);
      showSuccessToast(message);
    }

    return data;
  } catch (error) {
    // Network or parsing error
    const errorMsg = error instanceof Error ? error.message : 'Network error';
    console.error(`[API Network Error] ${method} ${endpoint}`, {
      error: errorMsg,
      url,
    });

    const apiResponse: ApiResponse<T> = {
      success: false,
      error: errorMsg,
      errorType: 'NETWORK_ERROR',
      details: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    };

    // Show error toast if enabled
    if (shouldShowError) {
      showErrorToast(
        errorMessage || 'Network error occurred',
        apiResponse.errorType,
        apiResponse.details
      );
    }

    return apiResponse;
  }
}

// Helper function to get default success messages based on HTTP method
function getDefaultSuccessMessage(method: string): string {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'Created successfully';
    case 'PUT':
    case 'PATCH':
      return 'Updated successfully';
    case 'DELETE':
      return 'Deleted successfully';
    default:
      return 'Operation completed successfully';
  }
}

export default apiCall;
