import apiCall, { ApiResponse } from '../api';

// Todo types
export interface Todo {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  completed?: boolean;
}

// Todo API endpoints
const ENDPOINTS = {
  getAllTodos: '/api/todos',
  getTodoById: (id: string) => `/api/todos/${id}`,
  createTodo: '/api/todos',
  updateTodo: (id: string) => `/api/todos/${id}`,
  deleteTodo: (id: string) => `/api/todos/${id}`,
};

// Get all todos
export const getAllTodos = async (): Promise<ApiResponse<Todo[]>> => {
  return apiCall<Todo[]>(ENDPOINTS.getAllTodos, {
    showErrorToast: true,
    errorMessage: 'Failed to fetch todos',
  });
};

// Get todo by ID
export const getTodoById = async (id: string): Promise<ApiResponse<Todo>> => {
  return apiCall<Todo>(ENDPOINTS.getTodoById(id), {
    showErrorToast: true,
    errorMessage: 'Failed to fetch todo',
  });
};

// Create new todo
export const createTodo = async (
  data: CreateTodoRequest
): Promise<ApiResponse<Todo>> => {
  return apiCall<Todo>(ENDPOINTS.createTodo, {
    method: 'POST',
    body: JSON.stringify(data),
    showSuccessToast: true,
    successMessage: 'Todo created successfully',
    errorMessage: 'Failed to create todo',
  });
};

// Update todo
export const updateTodo = async (
  id: string,
  data: UpdateTodoRequest
): Promise<ApiResponse<Todo>> => {
  return apiCall<Todo>(ENDPOINTS.updateTodo(id), {
    method: 'PUT',
    body: JSON.stringify(data),
    showSuccessToast: true,
    successMessage: 'Todo updated successfully',
    errorMessage: 'Failed to update todo',
  });
};

// Delete todo
export const deleteTodo = async (id: string): Promise<ApiResponse<void>> => {
  return apiCall<void>(ENDPOINTS.deleteTodo(id), {
    method: 'DELETE',
    showSuccessToast: true,
    successMessage: 'Todo deleted successfully',
    errorMessage: 'Failed to delete todo',
  });
};

// Toggle todo completion status
export const toggleTodoComplete = async (
  id: string,
  currentStatus: boolean
): Promise<ApiResponse<Todo>> => {
  return apiCall<Todo>(ENDPOINTS.updateTodo(id), {
    method: 'PUT',
    body: JSON.stringify({ completed: !currentStatus }),
    showSuccessToast: false, // Don't show toast for toggle to avoid spam
    errorMessage: 'Failed to toggle todo status',
  });
};
