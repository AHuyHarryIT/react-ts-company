import { createFileRoute } from '@tanstack/react-router';
import { requireRole } from '@utils/authUtil';

export const Route = createFileRoute('/_authenticated/employee/scan')({
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;
    requireRole(user, ['kho']);
  }
});
