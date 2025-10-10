import RequestFormList from '@/pages/request-forms';
import { createFileRoute } from '@tanstack/react-router';
import { requireRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/request-forms/')({
  component: RequestFormList,
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;

    // Chỉ cho phép admin roles, không cho supervisor access trang này
    // Supervisor sẽ dùng tab "Duyệt đơn" trong /employee/request-forms/
    requireRole(user, ['admin', 'super admin', 'co admin']);
  }
});
