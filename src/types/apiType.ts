export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
}

export interface ValidationErrors {
  [field: string]: string[];
}

export interface ApiErrorResponse {
  error: {
    code: number;
    message: string;
    errors?: ValidationErrors;
  };
}
