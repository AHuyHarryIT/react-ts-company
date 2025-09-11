import axiosPrivate from '@/api/axiosInstance';
import { EmployeeType } from '@/types/employeeType';
import { ProfileUpdateParams } from '@/types/profileType';

const ENDPOINT = '/api/profile';

export const fetchProfile = async () => {
  const response = await axiosPrivate.get<EmployeeType, EmployeeType>(ENDPOINT);
  return response;
};

export const changesPassword = async (data: {
  password: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const response = await axiosPrivate.patch(
    `${ENDPOINT}/change-password`,
    data
  );
  return response;
};

export const resetPassword = async (id: string) => {
  const response = await axiosPrivate.put(`${ENDPOINT}/reset-password/${id}`);
  return response;
};

export const updateProfile = async (data: ProfileUpdateParams) => {
  const response = axiosPrivate.patch(ENDPOINT, data);
  return response;
};

export const changeAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await axiosPrivate.post(
    `${ENDPOINT}/change-avatar`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response;
};
