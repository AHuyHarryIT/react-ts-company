import RequestFormDetail from '@pages/request-forms/detail';
import { createFileRoute } from '@tanstack/react-router';
import { requireRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/request-forms/$id')({
  component: RequestFormDetail,
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;

    // Chỉ cho phép admin roles, không cho supervisor access trang này
    // Supervisor sẽ dùng detail view trong /employee/request-forms/
    requireRole(user, ['admin', 'super admin', 'co admin']);
  }
});
