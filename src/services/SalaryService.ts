import axiosPrivate from '@/api/axiosInstance';
import {
  AttendanceTableType,
  CategoryTableType,
  SalaryDetailTableType,
  SalaryTableType,
  SalaryType
} from '@/types/salaryType';
import { handleApiError } from '@utils/handleApiError';

const ENDPOINT = '/api/salaries';

type FilterSalary = {
  title?: string;
  start_date?: string;
  end_date?: string;
  total?: string;
  sort?: string;
};

export type FetchSalariesParams = {
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

export type FetchSalaryParams = {
  id: string;
  company?: string;
};

type SalaryTableResponse = {
  category: CategoryTableType[];
  salary: SalaryTableType[];
  salaryDetail: SalaryDetailTableType[];
  attendance: AttendanceTableType[];
};

export type AddSalaryParams = {
  title: string;
  start_date: string;
  end_date: string;
  importA7A: File;
  importVVP: File;
};

// Fetch all salaries
export const fetchSalaries = async ({
  page,
  limit,
  filters
}: FetchSalariesParams) => {
  const response: {
    data: SalaryResponse[];
    total: number;
  } = await axiosPrivate.get(ENDPOINT, {
    params: {
      page: page,
      limit: limit,
      ...filters
    }
  });

  const salaries: SalaryType[] = response.data.map((salary: SalaryResponse) => {
    return {
      id: salary.id,
      title: salary.title,
      total: salary.total,
      start_date: salary.start_date,
      end_date: salary.end_date
    };
  });

  const total = response.total;

  return { salaries, total };
};

// TODO: optimization for this function
// Fetch a salary by id
export const fetchSalary = async ({ id, company }: FetchSalaryParams) => {
  const response: SalaryTableResponse = await axiosPrivate.get(
    `${ENDPOINT}/${id}`,
    {
      params: {
        company: company
      }
    }
  );

  return {
    category: response.category,
    salary: response.salary,
    salaryDetail: response.salaryDetail,
    attendance: response.attendance
  };
};

// Add a salary
export const addSalary = async ({
  title,
  start_date,
  end_date,
  importA7A,
  importVVP
}: AddSalaryParams) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('start_date', start_date);
  formData.append('end_date', end_date);
  formData.append('file_a7a', importA7A);
  formData.append('file_vvp', importVVP);

  try {
    const response = await axiosPrivate.post(ENDPOINT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete a salary
export const deleteSalary = async (id: string) => {
  try {
    const response = await axiosPrivate.delete(`${ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
