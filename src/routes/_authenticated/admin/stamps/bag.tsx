import BagStamp from '@pages/admin/stamps/bag';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/stamps/bag')({
  component: BagStamp
});
