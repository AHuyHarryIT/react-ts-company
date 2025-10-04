import axiosPrivate from '@/api/axiosInstance';
import {
  CreateRequestFormDto,
  UpdateRequestFormDto,
  RequestFormFilters,
  RequestFormListResponse,
  RequestFormDetailResponse,
  RequestFormTypesResponse,
  RequestFormStatisticsResponse,
  ApproveRequestFormDto
} from '@/types/requestFormType';

// Employee RequestForm Service
export const employeeRequestFormService = {
  // Get employee's request forms with filters
  getList: async (
    filters?: RequestFormFilters
  ): Promise<RequestFormListResponse> => {
    const params = new URLSearchParams();

    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    if (filters?.per_page)
      params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/api/employee/request-forms?${queryString}`
      : '/api/employee/request-forms';

    return await axiosPrivate.get(url);
  },

  // Get request form types and statuses
  getTypes: async (): Promise<RequestFormTypesResponse> => {
    return await axiosPrivate.get('/api/employee/request-forms/types');
  },

  // Get detail of specific request form
  getDetail: async (id: number): Promise<RequestFormDetailResponse> => {
    return await axiosPrivate.get(`/api/employee/request-forms/${id}`);
  },

  // Create new request form
  create: async (
    data: CreateRequestFormDto | FormData
  ): Promise<RequestFormDetailResponse> => {
    const config =
      data instanceof FormData
        ? {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        : {};

    return await axiosPrivate.post('/api/employee/request-forms', data, config);
  },

  // Update existing request form (only pending status)
  update: async (
    id: number,
    data: UpdateRequestFormDto | FormData
  ): Promise<RequestFormDetailResponse> => {
    const config =
      data instanceof FormData
        ? {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        : {};

    return await axiosPrivate.put(
      `/api/employee/request-forms/${id}`,
      data,
      config
    );
  },

  // Delete request form (only pending status)
  delete: async (
    id: number
  ): Promise<{ success: boolean; message: string }> => {
    return await axiosPrivate.delete(`/api/employee/request-forms/${id}`);
  }
};

// Admin RequestForm Service
export const adminRequestFormService = {
  // Get all request forms with filters
  getList: async (
    filters?: RequestFormFilters
  ): Promise<RequestFormListResponse> => {
    const params = new URLSearchParams();

    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.employee_id) params.append('employee_id', filters.employee_id);
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    if (filters?.per_page)
      params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/api/request-forms?${queryString}`
      : '/api/request-forms';

    return await axiosPrivate.get(url);
  },

  // Get statistics
  getStatistics: async (): Promise<RequestFormStatisticsResponse> => {
    return await axiosPrivate.get('/api/request-forms/statistics');
  },

  // Get detail of specific request form
  getDetail: async (id: number): Promise<RequestFormDetailResponse> => {
    return await axiosPrivate.get(`/api/request-forms/${id}`);
  },

  // Approve or reject request form
  approveOrReject: async (
    id: number,
    data: ApproveRequestFormDto
  ): Promise<RequestFormDetailResponse> => {
    return await axiosPrivate.post(`/api/request-forms/${id}/approve`, data);
  },

  // Approve or reject request form with signatures (multipart/form-data)
  approveOrRejectWithSignatures: async (
    id: number,
    data: {
      action: 'approve' | 'reject';
      digital_signature_supervisor?: File;
      digital_signature_manager?: File;
      reject_reason?: string;
    }
  ): Promise<RequestFormDetailResponse> => {
    const formData = new FormData();
    formData.append('action', data.action);

    if (data.reject_reason) {
      formData.append('rejection_reason', data.reject_reason);
    }

    if (data.digital_signature_supervisor) {
      formData.append(
        'digital_signature_supervisor',
        data.digital_signature_supervisor
      );
    }

    if (data.digital_signature_manager) {
      formData.append(
        'digital_signature_manager',
        data.digital_signature_manager
      );
    }

    return await axiosPrivate.post(
      `/api/request-forms/${id}/approve`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  }
};

// Export both services
export const requestFormService = {
  employee: employeeRequestFormService,
  admin: adminRequestFormService
};
