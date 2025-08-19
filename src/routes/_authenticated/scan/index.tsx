import ScanProduct from '@pages/employee/scan/ScanProduct';
import { createFileRoute } from '@tanstack/react-router';
import { requireRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/scan/')({
  component: ScanProduct,
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;
    requireRole(user, ['kho']);
  }
});
