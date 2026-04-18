export const API_URL =
  import.meta.env.VITE_BASE_API_URL || 'http://localhost:8000';

export const STORAGE_URL =
  import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

export const SALARY_WEB_CALCULATE_MODE =
  import.meta.env.VITE_SALARY_WEB_CALCULATE_MODE === 'fe-driven-map'
    ? 'fe-driven-map'
    : 'be-calculate';
