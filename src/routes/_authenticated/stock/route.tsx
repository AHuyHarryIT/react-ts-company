import { createFileRoute } from '@tanstack/react-router';
import { requireRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/stock')({
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;

    // Cho phép admin và các role có quyền quản lý kho
    requireRole(user, [
      'admin',
      'super admin',
      'co admin',
      'kho',
      'tổ trưởng kho',
      24
    ]);
  }
});
