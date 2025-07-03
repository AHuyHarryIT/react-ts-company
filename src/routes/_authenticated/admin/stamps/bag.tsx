import BagStamp from '@pages/admin/stamps/BagStamp';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/stamps/bag')({
  component: BagStamp
});
