import axiosPrivate from '@/api/axiosInstance';
import { WorkScheduleCategoryType } from '@/types/workScheduleCategoryType';
import { handleApiError } from '@utils/handleApiError';

type FilterWorkScheduleCategory = {
  name?: string;
};

export type FetchWorkScheduleCategoryParams = {
  page?: number;
  limit?: number;
  filters?: FilterWorkScheduleCategory;
};

type WorkScheduleCategoryResponse = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

// Fetch all work schedule categories
export const apiFetchWorkScheduleCategories = async ({
  page,
  limit,
  filters,
}: FetchWorkScheduleCategoryParams) => {
  try {
    const response = await axiosPrivate.get('/api/calendar-categories', {
      params: {
        page: page,
        limit: limit,
        ...filters,
      },
    });

    const categoryList: WorkScheduleCategoryType[] = response.data.data.map(
      (category: WorkScheduleCategoryResponse) => {
        return {
          id: category.id,
          name: category.name,
          created_at: category.created_at,
          updated_at: category.updated_at,
        };
      }
    );

    const total: number = response.data.total;

    return {
      workScheduleCategories: categoryList,
      total: total,
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

// Add a new work schedule category
export const apiAddWorkScheduleCategory = async (name: string) => {
  try {
    await axiosPrivate.post('/api/calendar-categories', { name });
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update a work schedule category
export const apiUpdateWorkScheduleCategory = async (
  id: string,
  name: string
) => {
  try {
    await axiosPrivate.patch(`/api/calendar-categories/${id}`, {
      name,
    });
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete a work schedule category
export const apiDeleteWorkScheduleCategory = async (id: string) => {
  try {
    await axiosPrivate.delete(`/api/calendar-categories/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};
