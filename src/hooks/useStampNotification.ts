import { HistoryPrintStampType } from '@/types/stampType';
import { Route } from '@routes/__root';
import { echo } from '@utils/lib/echo';
import { useEffect, useState } from 'react';

export type StampNotificationPayload = {
  message: string;
  recordId: string;
  meta?: HistoryPrintStampType;
  sent_at?: string;
};

export function useStampNotification() {
  const [items, setItems] = useState<StampNotificationPayload[]>([]);

  const { authenticated } = Route.useRouteContext();
  const { user } = authenticated;
  const roleId = user?.role.id;

  useEffect(() => {
    const channel = echo.channel(`public.stamps.${roleId}`);

    const handler = (payload: StampNotificationPayload) => {
      setItems((prev) => [payload, ...prev]);
    };

    channel.listen(`.stamp.created.${roleId}`, handler);

    return () => {
      channel.stopListening(`.stamp.created.${roleId}`);
      echo.leaveChannel(`public.stamps.${roleId}`);
    };
  }, [roleId]);

  return { items };
}
