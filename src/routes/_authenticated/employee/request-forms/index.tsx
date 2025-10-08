import RequestFormTabs from '@pages/employee/request-forms/RequestFormTabs';
import { createFileRoute } from '@tanstack/react-router';
import { disableRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/employee/request-forms/')(
  {
    component: RequestFormTabs,
    beforeLoad: async ({ context }) => {
      const { user } = context.authenticated;

      // Ngăn admin và supervisor truy cập route này
      // Họ nên dùng /request-forms thay vì /employee/request-forms
      disableRole(user, ['admin', 'super admin', 'co admin']);

      // Note: Supervisor sẽ có role thường nhưng có user ID đặc biệt
      // Nên không cần check thêm ở đây
    }
  }
);
