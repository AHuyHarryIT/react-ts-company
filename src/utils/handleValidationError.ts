import { AxiosError } from 'axios';

import { ApiErrorResponse, ValidationErrors } from '@/types/apiType';

export const handleValidationErrors = <T extends object>(
  error: AxiosError<ApiErrorResponse>
) => {
  if (error.response?.status === 422 && error.response.data?.error?.errors) {
    const validationErrors: ValidationErrors = error.response.data.error.errors;

    const formatted = Object.entries(validationErrors).map(
      ([field, message]) => ({
        name: field as keyof T,
        errors: message
      })
    );

    return formatted;
  }
};
