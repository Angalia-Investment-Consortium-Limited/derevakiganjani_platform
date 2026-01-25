// Frappe backend URL
export const FRAPPE_URL = import.meta.env.VITE_FRAPPE_URL || 'https://derevakiganjani.mdvfleet.co.tz';

// Helper function to get the full API URL
export const getAPIUrl = (endpoint: string): string => {
  return `${FRAPPE_URL}${endpoint}`;
};

// Helper to store auth token
export const setAuthToken = (token: string) => {
  localStorage.setItem('frappe_token', token);
};

// Helper to get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('frappe_token');
};

// Helper to remove auth token
export const removeAuthToken = () => {
  localStorage.removeItem('frappe_token');
};

// Helper to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
