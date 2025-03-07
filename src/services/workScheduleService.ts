import apiPrivate from '@/api/axiosInstance';
import { WorkScheduleType } from '@/types/workScheduleType';
import { handleApiError } from '@utils/handleApiError';

type FilterWorkSchedule = {
  name?: string;
};

export type FetchWorkScheduleParams = {
  page?: number;
  limit?: number;
  filters?: FilterWorkSchedule;
};

type WorkScheduleResponse = {
  id: string;
  title: string;
  date: string;
};

const API_URL = '/api/calendars';

// Fetch all work calendars
export const apiFetchWorkSchedules = async ({
  page,
  limit,
  filters,
}: FetchWorkScheduleParams) => {
  try {
    const response = await apiPrivate.get(API_URL, {
      params: {
        page: page,
        limit: limit,
        ...filters,
      },
    });

    const workScheduleList: WorkScheduleType[] = response.data.data.map(
      (workSchedule: WorkScheduleResponse) => {
        return {
          id: workSchedule.id,
          name: workSchedule.title,
          start_date: workSchedule.date,
        };
      }
    );

    const total: number = response.data.total;

    return {
      workSchedules: workScheduleList,
      total: total,
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

// Add a new work calendar
export const apiAddWorkSchedule = async (
  title: string,
  start_date: string,
  fileImport: File
) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('date', start_date);
  formData.append('fileImport', fileImport);

  try {
    const response = await apiPrivate.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete a work calendar
export const apiDeleteWorkSchedule = async (id: string) => {
  try {
    const response = await apiPrivate.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
