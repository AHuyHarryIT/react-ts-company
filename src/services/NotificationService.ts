import axiosPrivate from '@/api/axiosInstance';
import {
  NotificationCreateType,
  NotificationType,
  NotificationUpdateType
} from '@/types/notificationType';
import { QueryParams } from '@/types/queryParams';
import { PaginatedResponse } from '@/types/responseTypes';

const END_POINT = '/api/notifications';

export const fetchNotifications = async (params: QueryParams) => {
  const response = await axiosPrivate.get<
    NotificationType,
    PaginatedResponse<NotificationType>
  >(END_POINT, { params });

  return response;
};

export const fetchNotification = async (id: string) => {
  const response = await axiosPrivate.get<NotificationType, NotificationType>(
    `${END_POINT}/${id}`
  );

  return response;
};

export const createNotification = async (data: NotificationCreateType) => {
  const response = await axiosPrivate.post<NotificationType, NotificationType>(
    END_POINT,
    data
  );

  return response;
};

export const updateNotification = async (
  id: string,
  data: NotificationUpdateType
) => {
  const response = await axiosPrivate.patch<NotificationType, NotificationType>(
    `${END_POINT}/${id}`,
    data
  );

  return response;
};

export const deleteNotification = async (id: string) => {
  const response = await axiosPrivate.delete<
    NotificationType,
    NotificationType
  >(`${END_POINT}/${id}`);

  return response;
};
