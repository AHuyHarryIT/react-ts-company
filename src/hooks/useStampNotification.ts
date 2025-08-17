import { HistoryPrintStampType } from '@/types/stampType';
import { Route } from '@routes/__root';
import {
  clearStampNotifications,
  setStampNotifications,
  stampNotificationStore,
  removeStampNotification
} from '@stores/stampNotificationStore';
import { useStore } from '@tanstack/react-store';
import { isAdmin } from '@utils/authUtil';
import { echo } from '@utils/lib/echo';
import { handleNotification } from '@utils/notificationUtil';
import { useEffect } from 'react';

export type StampNotificationPayload = {
  message: string;
  recordId: string;
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
  const admin = isAdmin(user?.role.name || '');

  // Only show notifications for admin
  const items = admin ? notifications : [];

  const handleClearNotifications = () => {
    clearStampNotifications();
  };

  useEffect(() => {
    const channel = echo.channel(`public.stamps.${roleId}`);

    const handler = (payload: StampNotificationPayload) => {
      setStampNotifications(payload);
      handleNotification();
    };

    channel.listen(`.stamp.created.${roleId}`, handler);

    return () => {
      channel.stopListening(`.stamp.created.${roleId}`);
      echo.leaveChannel(`public.stamps.${roleId}`);
    };
  }, [roleId]);

  const handleRemoveNotification = (recordId: string) => {
    removeStampNotification(recordId);
  };

  return { items, handleClearNotifications, handleRemoveNotification };
}
