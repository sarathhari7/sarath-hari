# Toast Notification System

## Overview
A reusable toast notification system using **shadcn/ui + Sonner** that automatically handles all API responses with color-coded notifications:
- **Green Background**: Success
- **Red Background**: Error (with errorType and details)
- **Yellow Background**: Warning

## Features
- **Automatic Error Handling**: All API errors automatically show toasts with errorType and details
- **Color-Coded Backgrounds**: Success (green), Error (red), Warning (yellow), Info (blue)
- **Bottom-Right Position**: Non-intrusive placement in the bottom-right corner
- **Standardized Format**: Consistent error display across the entire application
- **No Manual Setup Required**: Just call API functions - toasts are handled automatically
- **Modern Design**: Clean, bold backgrounds with proper contrast for readability

## How It Works

### 1. Automatic Toast on API Calls

All API calls through the `apiCall` function automatically show toasts:

```typescript
// GET requests - no success toast (to avoid spam)
const response = await getMonthTransactions('2026-02');
// ❌ Error toast shown automatically if it fails
// ✅ No success toast (GET requests are silent on success)

// POST/PUT/DELETE requests - success toast shown automatically
const response = await createTemplate(data);
// ✅ Success: "Recurring transaction created successfully"
// ❌ Error: Shows error with Type and Details
```

### 2. Custom Success Messages

You can customize success messages in the service layer:

```typescript
// client/src/services/budgetService.ts
export const createTemplate = async (template) => {
  return apiCall('/api/budget/template', {
    method: 'POST',
    body: JSON.stringify(template),
    successMessage: 'Recurring transaction created successfully', // Custom message
    errorMessage: 'Failed to create recurring transaction',      // Custom error message
  });
};
```

### 3. Manual Toast Usage

For cases where you need manual control:

```typescript
import { showSuccessToast, showErrorToast, showWarningToast, showInfoToast } from 'utils/toast';

// Success toast
showSuccessToast('Operation completed successfully');

// Error toast with details
showErrorToast(
  'Failed to save data',
  'VALIDATION_ERROR',  // errorType
  'Invalid email format' // details
);

// Warning toast
showWarningToast('This action cannot be undone', 'Proceeding will delete all data');

// Info toast
showInfoToast('New feature available!');
```

### 4. Promise-Based Toast

For operations that take time:

```typescript
import { showPromiseToast } from 'utils/toast';

const response = await showPromiseToast(
  apiCall('/api/budget/template', { method: 'POST', body: data }),
  {
    loading: 'Creating transaction...',
    success: 'Transaction created!',
    error: 'Failed to create transaction'
  }
);
```

## Configuration

### Toast Options

```typescript
interface ToastOptions {
  duration?: number;  // Default: 4000ms (success), 6000ms (error)
  position?: 'top-left' | 'top-center' | 'top-right' |
             'bottom-left' | 'bottom-center' | 'bottom-right';
}
```

### API Call Options

```typescript
interface ApiCallOptions {
  showErrorToast?: boolean;     // Default: true
  showSuccessToast?: boolean;   // Default: true for POST/PUT/DELETE, false for GET
  successMessage?: string;      // Custom success message
  errorMessage?: string;        // Custom error message
}
```

## Error Format

All errors automatically display:
- **Main Message**: The error message
- **Type**: Error type (VALIDATION_ERROR, DATABASE_ERROR, NOT_FOUND, NETWORK_ERROR)
- **Details**: Additional details about the error

Example error toast:
```
❌ Failed to delete transaction
Type: DATABASE_ERROR • Details: Cannot read properties of undefined
```

## Backend Error Response Format

Ensure your backend returns errors in this format:

```json
{
  "success": false,
  "error": "Failed to delete template from month onwards",
  "errorType": "DATABASE_ERROR",
  "details": "Cannot read properties of undefined (reading 'documentId')",
  "timestamp": "2026-02-14T04:04:55.635Z"
}
```

## Files

- `client/src/components/ui/sonner.tsx` - Toaster component (added via shadcn)
- `client/src/utils/toast.tsx` - Toast utility functions
- `client/src/services/api.ts` - Automatic toast integration
- `client/src/services/budgetService.ts` - Example usage with custom messages
- `client/src/App.tsx` - Toaster component integration

## Benefits

1. **Zero Boilerplate**: No need to manually add toast code to every API call
2. **Consistent UX**: All errors are displayed in the same format
3. **Better Debugging**: errorType and details help identify issues quickly
4. **User-Friendly**: Clear, color-coded notifications
5. **Flexible**: Can be customized per API call or used manually when needed
