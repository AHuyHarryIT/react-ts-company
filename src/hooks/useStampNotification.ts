import { HistoryPrintStampType } from '@/types/stampType';
import { Route } from '@routes/__root';
import {
  clearStampNotifications,
  removeStampNotification,
  setStampNotifications,
  stampNotificationStore
} from '@stores/stampNotificationStore';
import { useStore } from '@tanstack/react-store';
import { isAllowRole } from '@utils/authUtil';
import { echo } from '@utils/lib/echo';
import { handleNotification } from '@utils/notificationUtil';
import { useEffect } from 'react';

export type StampNotificationPayload = {
  message: string;
  recordId: string;
  roleId?: string | number;
  meta?: HistoryPrintStampType;
  sent_at?: string;
};

export function useStampNotification() {
  const { stamp_notification: notifications } = useStore(
    stampNotificationStore
  );

  const { authenticated } = Route.useRouteContext();
  const { user } = authenticated;
  const roleId = user?.role.id;
  const allow = isAllowRole(user, [
    'super admin',
    'qa-qc',
    'qc',
    'tổ trưởng qc',
    23
  ]);

  // Only show notifications for admin
  const items = allow ? notifications : [];

  const handleClearNotifications = () => {
    clearStampNotifications();
  };

  useEffect(() => {
    if (!allow || !roleId) return;

    const channelName = `public.stamps.${roleId}`;
    const eventName = '.stamp.created';
    const channel = echo.channel(channelName);

    const handler = (payload: StampNotificationPayload) => {
      setStampNotifications(payload);
      handleNotification();
    };

    channel.listen(eventName, handler);

    return () => {
      channel.stopListening(eventName);
      echo.leaveChannel(channelName);
    };
  }, [allow, roleId]);

  const handleRemoveNotification = (recordId: string) => {
    removeStampNotification(recordId);
  };

  return { items, handleClearNotifications, handleRemoveNotification };
}
