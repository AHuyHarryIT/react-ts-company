import axiosPrivate from '@/api/axiosInstance';
import { WorkScheduleCategoryType } from '@/types/workScheduleCategoryType';

type FilterWorkScheduleCategory = {
  name?: string;
};

export type FetchWorkScheduleCategoryParams = {
  page?: number;
  limit?: number;
  filters?: FilterWorkScheduleCategory;
};

type WorkScheduleCategoryResponse = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

const API_URL = '/api/schedule-categories';

// Fetch all work schedule categories
export const fetchWorkScheduleCategories = async ({
  page,
  limit,
  filters
}: FetchWorkScheduleCategoryParams) => {
  const response: {
    data: WorkScheduleCategoryResponse[];
    total: number;
  } = await axiosPrivate.get(API_URL, {
    params: {
      page: page,
      limit: limit,
      ...filters
    }
  });

  const categoryList: WorkScheduleCategoryType[] = response.data.map(
    (category: WorkScheduleCategoryResponse) => {
      return {
        id: category.id,
        name: category.name,
        created_at: category.created_at,
        updated_at: category.updated_at
      };
    }
  );

  const total = response.total;

  return {
    workScheduleCategories: categoryList,
    total: total
  };
};

// Add a new work schedule category
export const addWorkScheduleCategory = async (name: string) => {
  return await axiosPrivate.post(API_URL, { name });
};

// Update a work schedule category
export const updateWorkScheduleCategory = async (id: string, name: string) => {
  return await axiosPrivate.patch(`${API_URL}/${id}`, {
    name
  });
};

// Delete a work schedule category
export const deleteWorkScheduleCategory = async (id: string) => {
  return await axiosPrivate.delete(`${API_URL}/${id}`);
};
