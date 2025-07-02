import BoxStamp from '@pages/admin/stamps/box';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/stamps/box')({
  component: BoxStamp
});
