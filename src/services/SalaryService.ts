import axiosPrivate from '@/api/axiosInstance';
import { SalaryType } from '@/types/salaryType';
import { handleApiError } from '@utils/handleApiError';

const ENDPOINT = '/api/salary';

type FilterSalary = {
  name?: string;
};

export type FetchSalaryParams = {
  page?: number;
  limit?: number;
  filters?: FilterSalary;
};

type SalaryResponse = {
  id: string;
  title: string;
  total: number;
  start_date: string;
  end_date: string;
};

// Fetch all salaries
export const apiFetchSalaries = async (params: FetchSalaryParams) => {
  try {
    const response = await axiosPrivate.get(ENDPOINT, {
      params: {
        page: params.page,
        limit: params.limit,
        ...params.filters,
      },
    });

    const salaries: SalaryType[] = response.data.data.map(
      (salary: SalaryResponse) => {
        return {
          id: salary.id,
          name: salary.title,
          total: salary.total,
          start_date: salary.start_date,
          end_date: salary.end_date,
        };
      }
    );

    const total: number = response.data.total;

    return { salaries, total };
  } catch (error) {
    throw handleApiError(error);
  }
};

// TODO: wait for the API to be implemented
// Fetch a salary by id
export const apiFetchSalaryById = async (id: string) => {
  try {
    const response = await axiosPrivate.get(`${ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Add a salary
export const apiAddSalary = async (
  title: string,
  start_date: string,
  end_date: string,
  importA7A: File,
  importVVP: File
) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('start_date', start_date);
  formData.append('end_date', end_date);
  formData.append('importA7A', importA7A);
  formData.append('importVVP', importVVP);

  try {
    const response = await axiosPrivate.post(ENDPOINT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete a salary
export const apiDeleteSalary = async (id: string) => {
  try {
    const response = await axiosPrivate.delete(`${ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
