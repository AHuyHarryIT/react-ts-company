import { useEffect } from 'react';
import { useStore } from '@tanstack/react-store';
import { echo } from '@utils/lib/echo';
import { sendNotification } from '@utils/notificationUtil';
import {
  employeeNotificationStore,
  addEmployeeNotification,
  markAllEmployeeNotificationsRead,
  clearEmployeeNotifications
} from '@stores/employeeNotificationStore';

// ─── Payload Types (match BE broadcastWith()) ─────────────────────────────────

type SalaryCreatedPayload = {
  type: 'salary';
  id: number;
  title: string;
  start_date: string;
  end_date: string;
};

type ScheduleCreatedPayload = {
  type: 'schedule';
  id: number;
  title: string;
  date: string;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook to listen for admin broadcast notifications (salary & schedule created).
 * Subscribes to the `employee.notifications` public channel via Laravel Echo.
 *
 * @param enabled - true if the user should receive these notifications
 */
export function useEmployeeNotification(enabled: boolean) {
  const { items: notifications } = useStore(employeeNotificationStore);

  useEffect(() => {
    if (!enabled) return;

    const channelName = 'employee.notifications';
    const salaryEventName = '.salary.created';
    const scheduleEventName = '.schedule.created';
    const channel = echo.channel(channelName);

    // Friendly notification messages
    const salaryMessages = [
      'Lương về rồi, hãy vào xem nhé!',
      'Bảng lương mới đã có, check ngay nào!',
      'Lương tháng này đã lên, vào xem thôi!'
    ];
    const scheduleMessages = [
      'Lịch làm việc mới đã cập nhật!',
      'Có lịch làm việc mới, xem ngay nhé!',
      'Lịch mới lên rồi, sắp xếp công việc thôi!'
    ];
    const pickRandom = (arr: string[]) =>
      arr[Math.floor(Math.random() * arr.length)];

    // ── Salary Created ──
    const salaryHandler = (payload: SalaryCreatedPayload) => {
      const friendlyTitle = 'Bảng lương mới';
      const friendlyMsg = pickRandom(salaryMessages);

      addEmployeeNotification({
        id: `salary-${payload.id}`,
        type: 'salary',
        title: friendlyTitle,
        message: `"${payload.title}" — ${friendlyMsg}`,
        admin_name: '',
        created_at: new Date().toISOString()
      });

      sendNotification(friendlyTitle, {
        body: friendlyMsg,
        tag: `salary-${payload.id}`
      });
    };

    // ── Schedule Created ──
    const scheduleHandler = (payload: ScheduleCreatedPayload) => {
      const friendlyTitle = 'Lịch làm việc mới';
      const friendlyMsg = pickRandom(scheduleMessages);

      addEmployeeNotification({
        id: `schedule-${payload.id}`,
        type: 'schedule',
        title: friendlyTitle,
        message: `"${payload.title}" — ${friendlyMsg}`,
        admin_name: '',
        created_at: new Date().toISOString()
      });

      sendNotification(friendlyTitle, {
        body: friendlyMsg,
        tag: `schedule-${payload.id}`
      });
    };

    channel.listen(salaryEventName, salaryHandler);
    channel.listen(scheduleEventName, scheduleHandler);

    return () => {
      channel.stopListening(salaryEventName);
      channel.stopListening(scheduleEventName);
      echo.leaveChannel(channelName);
    };
  }, [enabled]);

  // ── Return ────────────────────────────────────────────────────────────

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAllRead: markAllEmployeeNotificationsRead,
    clearAll: clearEmployeeNotifications
  };
}
