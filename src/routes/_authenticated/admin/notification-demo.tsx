import { createFileRoute } from '@tanstack/react-router';
import NotificationDemo from '@pages/admin/NotificationDemo';

export const Route = createFileRoute('/_authenticated/admin/notification-demo')(
  {
    component: NotificationDemo
  }
);
