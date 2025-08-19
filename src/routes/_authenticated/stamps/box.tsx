import BoxStamp from '@pages/admin/stamps/BoxStamp';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/stamps/box')({
  component: BoxStamp
});
