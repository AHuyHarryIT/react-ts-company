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
  const allow = isAllowRole(user, ['super admin', 'qa-qc', 'qc']);

  // Only show notifications for admin
  const items = allow ? notifications : [];

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
