export type NotificationType = {
  id: string;
  message: string;
  is_show: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type NotificationCreateType = Omit<
  NotificationType,
  'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'is_show'
> & {
  is_show?: boolean;
};

export type NotificationUpdateType = Partial<NotificationCreateType>;
