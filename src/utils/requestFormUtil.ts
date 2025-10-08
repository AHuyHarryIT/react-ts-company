import { RequestForm } from '@/types/requestFormType';
import { SUPERVISOR_IDS } from '@/constants/supervisors';

/**
 * User type definition for request form utilities
 */
export interface RequestFormUser {
  id: string | number;
  role?: string | { name: string };
}

/**
 * Get user approval type based on role and supervisor IDs
 * @param user - Current user
 * @returns 'manager' | 'supervisor' | null
 */
export function getUserApprovalType(
  user: RequestFormUser | null
): 'manager' | 'supervisor' | null {
  if (!user) return null;

  // Get role name
  const roleName =
    typeof user.role === 'string' ? user.role : user.role?.name || '';

  // Check if user is admin/manager
  const adminRoles = ['admin', 'super admin', 'co admin', 'manager'];
  const isManager = adminRoles
    .map((role) => role.toLowerCase())
    .includes(roleName.toLowerCase());

  if (isManager) return 'manager';

  // Check if user is supervisor (has special user ID)
  const userId = user.id.toString();
  const isSupervisor = SUPERVISOR_IDS.some(
    (supId) =>
      supId.toString() === userId ||
      supId.toString().replace(/^0+/, '') === userId.replace(/^0+/, '')
  );

  if (isSupervisor) return 'supervisor';

  return null;
}

/**
 * Get signature type that current user should sign
 * @param record - Request form record
 * @param user - Current user
 * @returns 'supervisor' | 'manager' | null
 */
export function getUserSignatureType(
  record: RequestForm,
  user: RequestFormUser | null
): 'supervisor' | 'manager' | null {
  if (!user || !record) return null;

  const userType = getUserApprovalType(user);

  // For delegation forms, no signature needed
  if (record.type === 'giay_uy_quyen') {
    return null;
  }

  // Supervisor can sign if not signed yet (no need to wait for manager)
  if (userType === 'supervisor' && !record.has_supervisor_signature) {
    return 'supervisor';
  }

  // Manager can sign if not signed yet (no need to wait for supervisor)
  if (userType === 'manager' && !record.has_manager_signature) {
    return 'manager';
  }

  return null;
}

/**
 * Check if user can approve or reject the request form
 * @param record - Request form record
 * @param user - Current user
 * @returns Object with canApprove, canReject, and reason
 */
export function canUserApproveReject(
  record: RequestForm,
  user: RequestFormUser | null
): {
  canApprove: boolean;
  canReject: boolean;
  reason?: string;
} {
  if (!user || !record) {
    return {
      canApprove: false,
      canReject: false,
      reason: 'Không tìm thấy thông tin người dùng'
    };
  }

  const userType = getUserApprovalType(user);

  if (!userType) {
    return {
      canApprove: false,
      canReject: false,
      reason: 'Bạn không có quyền xử lý đơn này'
    };
  }

  // Can't approve/reject if not pending
  if (record.status !== 'pending') {
    return {
      canApprove: false,
      canReject: false,
      reason: 'Đơn này đã được xử lý'
    };
  }

  // For delegation forms
  if (record.type === 'giay_uy_quyen') {
    // Only managers can approve/reject delegation forms
    if (userType === 'manager') {
      return { canApprove: true, canReject: true };
    }
    return {
      canApprove: false,
      canReject: false,
      reason: 'Chỉ quản lý mới có quyền duyệt đơn ủy quyền'
    };
  }

  // For regular forms
  // Supervisor can sign/reject
  if (userType === 'supervisor') {
    if (record.has_supervisor_signature) {
      return {
        canApprove: false,
        canReject: true,
        reason: 'Bạn đã ký đơn này rồi'
      };
    }
    return { canApprove: true, canReject: true };
  }

  // Manager can sign/reject (no need to wait for supervisor)
  if (userType === 'manager') {
    if (record.has_manager_signature) {
      return {
        canApprove: false,
        canReject: true,
        reason: 'Bạn đã ký đơn này rồi'
      };
    }
    return { canApprove: true, canReject: true };
  }

  return {
    canApprove: false,
    canReject: false,
    reason: 'Không xác định được quyền hạn'
  };
}

/**
 * Get signature label based on signature type
 * @param signType - Type of signature
 * @returns Label string
 */
export function getSignatureLabel(
  signType: 'supervisor' | 'manager' | null
): string {
  switch (signType) {
    case 'supervisor':
      return 'Chữ ký Tổ trưởng';
    case 'manager':
      return 'Chữ ký Quản lý';
    default:
      return 'Chữ ký';
  }
}

/**
 * Check if request form needs signatures
 * @param record - Request form record
 * @returns boolean
 */
export function needsSignatures(record: RequestForm): boolean {
  // Delegation forms don't need signatures
  if (record.type === 'giay_uy_quyen') {
    return false;
  }

  // Regular forms need both supervisor and manager signatures
  return true;
}

/**
 * Check if request form signatures are complete
 * @param record - Request form record
 * @returns boolean
 */
export function areSignaturesComplete(record: RequestForm): boolean {
  // Delegation forms don't need signatures
  if (record.type === 'giay_uy_quyen') {
    return true;
  }

  // Regular forms need both signatures
  return !!record.has_supervisor_signature && !!record.has_manager_signature;
}
