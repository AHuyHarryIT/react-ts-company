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
