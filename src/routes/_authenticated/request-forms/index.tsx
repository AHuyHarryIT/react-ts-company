import RequestFormList from '@/pages/request-forms';
import { createFileRoute } from '@tanstack/react-router';
import { requireAdminOrSupervisor } from '@utils/authUtil';
import { SUPERVISOR_IDS } from '@/constants/supervisors';

export const Route = createFileRoute('/_authenticated/request-forms/')({
  component: RequestFormList,
  beforeLoad: async ({ context }) => {
    const { user } = context.authenticated;

    // Cho ph�p admin v� c�c supervisor c� user ID d?c bi?t
    requireAdminOrSupervisor(user, [...SUPERVISOR_IDS]);
  }
});
