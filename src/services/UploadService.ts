import axiosPrivate from '@/api/axiosInstance';
import { ImageType } from '@/types/files/imageType';
import { QueryParams } from '@/types/queryParams';
import { PaginatedResponse } from '@/types/responseTypes';

const END_POINT = '/api/upload';

export const fetchImages = async (params: QueryParams) => {
  const response = await axiosPrivate.get<
    ImageType,
    PaginatedResponse<ImageType>
  >(`${END_POINT}/images`, { params });
  return response;
};

export const fetchImage = async (id: string) => {
  const response = await axiosPrivate.get<ImageType, ImageType>(
    `${END_POINT}/images/${id}`
  );
  return response;
};

export const uploadImage = async (formData: FormData) => {
  const response = await axiosPrivate.post<ImageType, ImageType>(
    `${END_POINT}/images`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response;
};

export const deleteImage = async (id: string) => {
  const response = await axiosPrivate.delete<ImageType>(
    `${END_POINT}/images/${id}`
  );
  return response;
};
