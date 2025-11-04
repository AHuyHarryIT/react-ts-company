import React from 'react';
import { Table, Tag, Button, Space, Tooltip } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { EmployeeNameDisplay } from './Utilities';
import {
  RequestForm,
  RequestFormStatus,
  RequestFormType,
  REQUEST_FORM_TYPES,
  REQUEST_FORM_STATUSES
} from '@/types/requestFormType';
import {
  isRequestCreatedBySupervisor,
  getEffectiveStatus
} from '@/utils/requestFormUtil';

// Danh sách nhân viên nộp đơn thẳng cho quản lý, bỏ qua tổ trưởng
const DIRECT_TO_MANAGER_IDS = ['20122900', '23030100', '17031400'] as const;

interface RequestFormTableProps {
  data?: RequestForm[];
  loading?: boolean;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number, pageSize?: number) => void;
  };
  onView?: (record: RequestForm) => void;
  onEdit?: (record: RequestForm) => void;
  onDelete?: (record: RequestForm) => void;
  onApprove?: (record: RequestForm) => void;
  onReject?: (record: RequestForm) => void;
  onSignDelegation?: (record: RequestForm) => void; // Thêm cho ký đơn ủy quyền
  isAdmin?: boolean;
  currentUserId?: string; // Thêm để check user đã ký chưa
  userType?: 'admin' | 'supervisor'; // Thêm để biết loại user
  hideSignDelegation?: boolean; // Thêm để ẩn button ký đơn ủy quyền
}

export const DataTable: React.FC<RequestFormTableProps> = ({
  data = [],
  loading = false,
  pagination,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onSignDelegation,
  isAdmin = false,
  currentUserId,
  userType,
  hideSignDelegation = false
}) => {
  // Danh sách user ID được phép duyệt đơn (Admin2 và Super Admin)
  const ALLOWED_APPROVER_IDS = ['Admin2', 'Super Admin'] as const;
  const getStatusColor = (status: RequestFormStatus): string => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'authorized_approved':
        return 'cyan';
      default:
        return 'default';
    }
  };

  const canEdit = (record: RequestForm): boolean => {
    // ❌ Admin không được edit đơn
    if (isAdmin) return false;

    // ❌ Chỉ edit được khi status = pending
    if (record.status !== 'pending') return false;

    // ❌ LOGIC MỚI: Kiểm tra xem đã có chữ ký nào chưa
    // Nếu là đơn Ủy Quyền
    if (record.type === 'giay_uy_quyen') {
      const hasDelegatorSignature =
        record.has_delegator_signature || !!record.digital_signature_delegator;
      const hasAuthorizedSignature =
        record.has_authorized_signature ||
        !!record.digital_signature_authorized;

      // Nếu đã có bất kỳ chữ ký nào thì không cho edit
      if (hasDelegatorSignature || hasAuthorizedSignature) return false;
    } else {
      // Các đơn thường: Kiểm tra chữ ký supervisor và manager
      const hasSupervisorSignature =
        record.has_supervisor_signature ||
        !!record.digital_signature_supervisor;
      const hasManagerSignature =
        record.has_manager_signature || !!record.digital_signature_manager;

      // ❌ Nếu tổ trưởng hoặc quản lý đã ký thì KHÔNG cho edit
      if (hasSupervisorSignature || hasManagerSignature) return false;
    }

    // ✅ Chỉ cho edit khi: không phải admin, status = pending, chưa có chữ ký nào
    return true;
  };

  const canSignDelegation = (record: RequestForm): boolean => {
    // Chỉ cho phép ký đơn ủy quyền
    if (record.type !== 'giay_uy_quyen' || record.status !== 'pending')
      return false;

    // User không phải admin (admin chỉ duyệt, không ký)
    if (isAdmin) return false;

    const hasDelegatorSignature =
      record.has_delegator_signature || !!record.digital_signature_delegator;
    const hasAuthorizedSignature =
      record.has_authorized_signature || !!record.digital_signature_authorized;

    // Nếu user là người tạo đơn (delegator) và chưa ký
    if (
      record.employee.id.toString() === currentUserId &&
      !hasDelegatorSignature
    ) {
      return true;
    }

    // Nếu user là người được ủy quyền và chưa ký
    const formData = record.form_data as Record<string, unknown>;
    const authorizedEmployeeId = formData?.authorized_employee_id;
    if (authorizedEmployeeId === currentUserId && !hasAuthorizedSignature) {
      return true;
    }

    return false;
  };

  const canDelete = (record: RequestForm): boolean => {
    // ❌ Admin không được xóa đơn
    if (isAdmin) return false;

    // ❌ Chỉ xóa được khi status = pending
    if (record.status !== 'pending') return false;

    // ❌ LOGIC MỚI: Kiểm tra xem đã có chữ ký nào chưa
    // Nếu là đơn Ủy Quyền
    if (record.type === 'giay_uy_quyen') {
      const hasDelegatorSignature =
        record.has_delegator_signature || !!record.digital_signature_delegator;
      const hasAuthorizedSignature =
        record.has_authorized_signature ||
        !!record.digital_signature_authorized;

      // Nếu đã có bất kỳ chữ ký nào thì không cho xóa
      if (hasDelegatorSignature || hasAuthorizedSignature) return false;
    } else {
      // Các đơn thường: Kiểm tra chữ ký supervisor và manager
      const hasSupervisorSignature =
        record.has_supervisor_signature ||
        !!record.digital_signature_supervisor;
      const hasManagerSignature =
        record.has_manager_signature || !!record.digital_signature_manager;

      // ❌ Nếu tổ trưởng hoặc quản lý đã ký thì KHÔNG cho xóa
      if (hasSupervisorSignature || hasManagerSignature) return false;
    }

    // ✅ Chỉ cho xóa khi: không phải admin, status = pending, chưa có chữ ký nào
    return true;
  };

  const canApprove = (record: RequestForm): boolean => {
    // ❌ Không cho phép duyệt nếu không phải admin hoặc status không phải pending
    if (!isAdmin || record.status !== 'pending') return false;

    // ❌ Kiểm tra user ID: chỉ Admin2 và Super Admin mới được duyệt đơn
    if (
      currentUserId &&
      !(ALLOWED_APPROVER_IDS as readonly string[]).includes(currentUserId)
    ) {
      return false;
    }

    // ❌ ĐẶC BIỆT: Đơn Ủy Quyền - Admin KHÔNG được duyệt
    // Chỉ có người được ủy quyền mới ký duyệt đơn ủy quyền
    if (record.type === 'giay_uy_quyen') {
      return false;
    }

    // Check if signatures are effectively complete
    const effectiveStatus = getEffectiveStatus(record);
    if (effectiveStatus === 'approved') {
      return false; // Already complete
    }

    // Logic bình thường cho các đơn khác
    const hasSupervisorSignature =
      record.has_supervisor_signature || !!record.digital_signature_supervisor;
    const hasManagerSignature =
      record.has_manager_signature || !!record.digital_signature_manager;

    // Check if this request was created by a supervisor
    const createdBySupervisor = isRequestCreatedBySupervisor(record);

    // If supervisor created the request, only manager signature is needed for completion
    if (createdBySupervisor) {
      return !hasManagerSignature;
    }

    // ❌ Nếu đã có cả 2 chữ ký thì TUYỆT ĐỐI không cho phép duyệt nữa
    if (hasSupervisorSignature && hasManagerSignature) return false;

    // ❌ Nếu là SUPERVISOR và đã có chữ ký supervisor → không cho duyệt nữa
    if (userType === 'supervisor' && hasSupervisorSignature) {
      // Bất kể supervisor nào đã ký, supervisor khác cũng không được ký tiếp
      return false;
    }

    // ❌ Nếu là ADMIN/MANAGER và đã có chữ ký manager → không cho duyệt nữa
    if (userType === 'admin' && hasManagerSignature) {
      // Bất kể admin/manager nào đã ký, admin/manager khác cũng không được ký tiếp
      return false;
    }

    return true;
  };

  const canReject = (record: RequestForm): boolean => {
    // ❌ Không cho phép từ chối nếu không phải admin hoặc status không phải pending
    if (!isAdmin || record.status !== 'pending') return false;

    // ❌ Kiểm tra user ID: chỉ Admin2 và Super Admin mới được từ chối đơn
    if (
      currentUserId &&
      !(ALLOWED_APPROVER_IDS as readonly string[]).includes(currentUserId)
    ) {
      return false;
    }

    // ✅ ĐẶC BIỆT: Đơn Ủy Quyền - Admin CHỈ được từ chối (không được duyệt)
    if (record.type === 'giay_uy_quyen') {
      const hasDelegatorSignature =
        record.has_delegator_signature || !!record.digital_signature_delegator;
      const hasAuthorizedSignature =
        record.has_authorized_signature ||
        !!record.digital_signature_authorized;

      // Admin có thể từ chối khi có ít nhất 1 chữ ký
      return hasDelegatorSignature || hasAuthorizedSignature;
    }

    // Logic bình thường cho các đơn khác
    const hasSupervisorSignature =
      record.has_supervisor_signature || !!record.digital_signature_supervisor;
    const hasManagerSignature =
      record.has_manager_signature || !!record.digital_signature_manager;

    // Check if this request was created by a supervisor
    const createdBySupervisor = isRequestCreatedBySupervisor(record);

    // If supervisor created the request, only manager signature matters for rejection logic
    if (createdBySupervisor) {
      // If manager already signed, cannot reject
      if (hasManagerSignature) return false;
      // Otherwise, admin/manager can reject
      return userType === 'admin';
    }

    // ❌ Nếu đã có cả 2 chữ ký thì không cho phép thao tác nữa (đơn đã hoàn thành)
    if (hasSupervisorSignature && hasManagerSignature) return false;

    // ✅ LOGIC MỚI: Admin/Manager luôn có quyền từ chối
    // - Nếu chỉ có chữ ký supervisor → Admin/Manager vẫn có thể từ chối
    // - Nếu chỉ có chữ ký manager → Admin khác vẫn có thể từ chối
    // - Nếu chưa có chữ ký nào → Admin vẫn có thể từ chối
    if (userType === 'admin') {
      return true; // Admin luôn có quyền từ chối (trừ khi đã có cả 2 chữ ký)
    }

    // ✅ Supervisor chỉ có thể từ chối khi chưa có chữ ký nào
    if (userType === 'supervisor') {
      // Nếu supervisor đã ký rồi → không cho supervisor khác từ chối
      if (hasSupervisorSignature) return false;
      // Nếu manager đã ký rồi → không cho supervisor từ chối
      if (hasManagerSignature) return false;
      return true;
    }

    // Default: cho phép từ chối nếu chưa có đủ 2 chữ ký
    return true;
  };

  const columns: ColumnsType<RequestForm> = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_, __, index) => (
        <span className="text-gray-500">
          {((pagination?.current || 1) - 1) * (pagination?.pageSize || 15) +
            index +
            1}
        </span>
      )
    },
    {
      title: 'Loại đơn',
      dataIndex: 'type',
      key: 'type',
      width: 160,
      render: (type: RequestFormType, record: RequestForm) => {
        const formData = record.form_data as Record<string, unknown>;
        let subtitle = '';

        // Hiển thị thông tin chi tiết dựa trên loại đơn
        if (type === 'don_xin_nghi_phep' && formData?.loai_nghi_phep) {
          subtitle = String(formData.loai_nghi_phep);
        } else if (
          type === 'don_xin_di_tre_ve_som' &&
          formData?.loai_di_tre_ve_som
        ) {
          subtitle =
            formData.loai_di_tre_ve_som === 'di_tre'
              ? 'Đi trễ'
              : formData.loai_di_tre_ve_som === 've_som'
                ? 'Về sớm'
                : 'Cả hai';
        } else if (type === 'giay_uy_quyen' && formData?.authorization_scope) {
          subtitle = `Ủy quyền: ${String(formData.authorization_scope)}`;
        }

        return (
          <div>
            <Tag color="blue" className="mb-1 font-medium">
              {REQUEST_FORM_TYPES[type]}
            </Tag>
            {subtitle && (
              <div className="mt-1 text-xs text-gray-500">{subtitle}</div>
            )}
          </div>
        );
      }
    },
    ...(isAdmin
      ? [
          {
            title: 'Nhân viên',
            dataIndex: ['employee', 'name'],
            key: 'employee_name',
            width: 180,
            render: (name: string, record: RequestForm) => (
              <div>
                <div className="text-sm font-medium">{name}</div>
                <div className="text-xs text-gray-500">
                  MSNV: {record.employee.id}
                </div>
              </div>
            )
          }
        ]
      : []),
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (_, record: RequestForm) => {
        // Use effective status to show correct status based on signatures
        const effectiveStatus = getEffectiveStatus(record);
        return (
          <Tag color={getStatusColor(effectiveStatus)} className="font-medium">
            {REQUEST_FORM_STATUSES[effectiveStatus]}
          </Tag>
        );
      }
    },
    {
      title: (
        <div className="text-center">
          <span>Chữ ký 1</span>
        </div>
      ),
      key: 'supervisor_approval',
      width: 150,
      align: 'center',
      render: (record: RequestForm) => {
        // Đặc biệt cho đơn Giấy ủy quyền
        if (record.type === 'giay_uy_quyen') {
          const hasDelegatorSignature =
            record.has_delegator_signature ||
            !!record.digital_signature_delegator;

          // Ưu tiên dùng delegatorApprovedBy (camelCase) từ BE mới, fallback về các field cũ
          const delegatorInfo =
            record.delegatorApprovedBy ||
            record.delegator_approved_by_employee ||
            (typeof record.delegator_approved_by === 'object' &&
            record.delegator_approved_by !== null
              ? record.delegator_approved_by
              : record.employee);
          const delegatorApprovedAt = record.delegator_approved_at;
          return (
            <div className="text-center">
              <div className="mb-1 text-xs font-medium text-gray-800">
                Người ủy quyền
              </div>
              {hasDelegatorSignature ? (
                <div>
                  <div className="mb-1 flex items-center justify-center text-xs">
                    <span className="mr-1 text-green-600">✓</span>
                    <span className="font-medium text-gray-800">Đã ký</span>
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="truncate font-medium text-gray-800">
                      {delegatorInfo.name}
                    </div>
                    {delegatorApprovedAt && (
                      <div className="text-blue-600">
                        {dayjs(delegatorApprovedAt).format('DD/MM HH:mm')}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center text-xs text-gray-400">
                  <span className="mr-1">○</span>
                  <span>Chưa ký</span>
                </div>
              )}
            </div>
          );
        }

        // Logic bình thường cho các đơn khác
        const hasSupervisorSignature =
          record.has_supervisor_signature ||
          !!record.digital_signature_supervisor;

        // Check if this request was created by a supervisor (employee_id === supervisor_id)
        const createdBySupervisor = isRequestCreatedBySupervisor(record);

        // Check if employee can submit directly to manager (bypass supervisor)
        const canSubmitDirectToManager = record.employee_id
          ? (DIRECT_TO_MANAGER_IDS as readonly string[]).includes(
              record.employee_id.toString()
            )
          : false;

        // Ưu tiên dùng supervisorApprovedBy (camelCase) từ BE mới
        const supervisorApprovedBy =
          record.supervisorApprovedBy ||
          record.supervisor_approved_by_employee ||
          (typeof record.supervisor_approved_by === 'object' &&
          record.supervisor_approved_by !== null
            ? record.supervisor_approved_by
            : null);

        const supervisorApprovedAt = record.supervisor_approved_at;

        return (
          <div className="text-center">
            <div className="mb-1 text-xs font-medium text-gray-800">
              {createdBySupervisor
                ? 'Tổ trưởng tạo đơn'
                : canSubmitDirectToManager
                  ? 'Người gửi'
                  : 'Tổ trưởng'}
            </div>
            {createdBySupervisor ? (
              // If supervisor created the request, show as signed by supervisor (same as applicant)
              <div>
                <div className="mb-1 flex items-center justify-center text-xs">
                  <span className="mr-1 text-green-600">✓</span>
                  <span className="font-medium text-gray-800">Đã ký</span>
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="truncate font-medium text-gray-800">
                    {record.employee?.name || 'Tổ trưởng'}
                  </div>
                  {record.created_at && (
                    <div className="text-blue-600">
                      {dayjs(record.created_at).format('DD/MM HH:mm')}
                    </div>
                  )}
                </div>
              </div>
            ) : canSubmitDirectToManager ? (
              // If employee can submit directly to manager, show as signed by applicant
              <div>
                <div className="mb-1 flex items-center justify-center text-xs">
                  <span className="mr-1 text-green-600">✓</span>
                  <span className="font-medium text-gray-800">Đã ký</span>
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="truncate font-medium text-gray-800">
                    {record.employee?.name || 'Người gửi'}
                  </div>
                  {record.created_at && (
                    <div className="text-blue-600">
                      {dayjs(record.created_at).format('DD/MM HH:mm')}
                    </div>
                  )}
                </div>
              </div>
            ) : hasSupervisorSignature ? (
              <div>
                <div className="mb-1 flex items-center justify-center text-xs">
                  <span className="mr-1 text-green-600">✓</span>
                  <span className="font-medium text-gray-800">Đã ký</span>
                </div>
                {supervisorApprovedBy && (
                  <div className="space-y-0.5 text-xs">
                    <div className="truncate font-medium text-gray-800">
                      {supervisorApprovedBy.name}
                    </div>
                    {supervisorApprovedAt && (
                      <div className="text-blue-600">
                        {dayjs(supervisorApprovedAt).format('DD/MM HH:mm')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center text-xs text-gray-400">
                <span className="mr-1">○</span>
                <span>Chưa ký</span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      title: (
        <div className="text-center">
          <span>Chữ ký 2</span>
        </div>
      ),
      key: 'manager_approval',
      width: 150,
      align: 'center',
      render: (record: RequestForm) => {
        // Đặc biệt cho đơn Giấy ủy quyền
        if (record.type === 'giay_uy_quyen') {
          const hasAuthorizedSignature =
            record.has_authorized_signature ||
            !!record.digital_signature_authorized;

          // Parse form_data nếu là string JSON
          let formData = record.form_data as Record<string, unknown>;
          if (typeof formData === 'string') {
            try {
              formData = JSON.parse(formData) as Record<string, unknown>;
            } catch {
              formData = {};
            }
          }

          // Ưu tiên dùng authorizedApprovedBy (camelCase) từ BE mới
          const authorizedInfo =
            record.authorizedApprovedBy ||
            record.authorized_approved_by_employee ||
            (typeof record.authorized_approved_by === 'object' &&
            record.authorized_approved_by !== null
              ? record.authorized_approved_by
              : null);
          const authorizedApprovedAt = record.authorized_approved_at;

          // Thông tin người được ủy quyền (dù chưa ký)
          const authorizedEmployee = record.authorizedEmployee || null;

          return (
            <div className="text-center">
              <div className="mb-1 text-xs font-medium text-gray-800">
                Người được ủy quyền
              </div>
              {hasAuthorizedSignature ? (
                <div>
                  <div className="mb-1 flex items-center justify-center text-xs">
                    <span className="mr-1 text-green-600">✓</span>
                    <span className="font-medium text-gray-800">Đã ký</span>
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="truncate font-medium text-gray-800">
                      {authorizedInfo ? (
                        authorizedInfo.name
                      ) : authorizedEmployee ? (
                        authorizedEmployee.name
                      ) : (
                        <EmployeeNameDisplay
                          employeeId={String(
                            formData?.authorized_employee_id || ''
                          )}
                          fallback="Chưa xác định"
                        />
                      )}
                    </div>
                    {authorizedApprovedAt && (
                      <div className="text-blue-600">
                        {dayjs(authorizedApprovedAt).format('DD/MM HH:mm')}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-1 flex items-center justify-center text-xs text-gray-400">
                    <span className="mr-1">○</span>
                    <span>Chưa ký</span>
                  </div>
                  <div className="text-xs">
                    <div className="truncate font-medium text-gray-800">
                      {authorizedEmployee ? (
                        authorizedEmployee.name
                      ) : (
                        <EmployeeNameDisplay
                          employeeId={String(
                            formData?.authorized_employee_id || ''
                          )}
                          fallback="Chưa xác định"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }

        // Logic bình thường cho các đơn khác
        const hasManagerSignature =
          record.has_manager_signature || !!record.digital_signature_manager;

        // Ưu tiên dùng managerApprovedBy (camelCase) từ BE mới
        const managerApprovedBy =
          record.managerApprovedBy ||
          record.manager_approved_by_employee ||
          (typeof record.manager_approved_by === 'object' &&
          record.manager_approved_by !== null
            ? record.manager_approved_by
            : null);

        const managerApprovedAt = record.manager_approved_at;

        return (
          <div className="text-center">
            <div className="mb-1 text-xs font-medium text-gray-800">
              Quản lý nhà máy
            </div>
            {hasManagerSignature ? (
              <div>
                <div className="mb-1 flex items-center justify-center text-xs">
                  <span className="mr-1 text-green-600">✓</span>
                  <span className="font-medium text-gray-800">Đã ký</span>
                </div>
                {managerApprovedBy && (
                  <div className="space-y-0.5 text-xs">
                    <div className="truncate font-medium text-gray-800">
                      {managerApprovedBy.name}
                    </div>
                    {managerApprovedAt && (
                      <div className="text-blue-600">
                        {dayjs(managerApprovedAt).format('DD/MM HH:mm')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center text-xs text-gray-400">
                <span className="mr-1">○</span>
                <span>Chưa ký</span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      title: 'Ngày nộp đơn',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      width: 140,
      render: (date: string) => (
        <span className="whitespace-nowrap text-gray-600">
          {dayjs(date).format('DD/MM/YYYY HH:mm')}
        </span>
      )
    },
    {
      title: 'Ngày duyệt đơn',
      dataIndex: 'approved_at',
      key: 'approved_at',
      width: 140,
      render: (date: string, record: RequestForm) => {
        const effectiveStatus = getEffectiveStatus(record);
        const createdBySupervisor = isRequestCreatedBySupervisor(record);

        // Đơn Ủy Quyền: Hiển thị ngày người được ủy quyền duyệt
        if (record.type === 'giay_uy_quyen') {
          if (
            record.status === 'authorized_approved' &&
            record.authorized_approved_at
          ) {
            return (
              <div>
                {/* <div className="text-xs text-gray-500 mb-0.5">Người được uỷ quyền</div> */}
                <span className="whitespace-nowrap text-gray-600">
                  {dayjs(record.authorized_approved_at).format(
                    'DD/MM/YYYY HH:mm'
                  )}
                </span>
              </div>
            );
          } else if (record.status === 'approved' && date) {
            const approverInfo =
              record.approved_by && typeof record.approved_by === 'object'
                ? record.approved_by
                : null;
            const approverName = approverInfo
              ? (approverInfo as { name: string }).name
              : null;

            return (
              <div>
                <div className="mb-0.5 text-xs text-gray-500">Admin duyệt:</div>
                <span className="whitespace-nowrap text-gray-600">
                  {dayjs(date).format('DD/MM/YYYY HH:mm')}
                </span>
                {approverName && (
                  <div className="mt-0.5 text-xs text-gray-500">
                    Bởi: {approverName}
                  </div>
                )}
              </div>
            );
          } else if (record.status === 'rejected' && date) {
            const approverInfo =
              record.approved_by && typeof record.approved_by === 'object'
                ? record.approved_by
                : null;
            const approverName = approverInfo
              ? (approverInfo as { name: string }).name
              : null;

            return (
              <div>
                <span className="whitespace-nowrap text-gray-600">
                  {dayjs(date).format('DD/MM/YYYY HH:mm')}
                </span>
                {approverName && (
                  <div className="mt-0.5 text-xs text-gray-500">
                    Từ chối bởi: {approverName}
                  </div>
                )}
              </div>
            );
          }
        }

        // For supervisor-created forms that are effectively approved by manager signature
        if (
          createdBySupervisor &&
          effectiveStatus === 'approved' &&
          record.manager_approved_at
        ) {
          const managerApprovedBy =
            record.managerApprovedBy || record.manager_approved_by_employee;
          return (
            <div>
              <span className="whitespace-nowrap text-gray-600">
                {dayjs(record.manager_approved_at).format('DD/MM/YYYY HH:mm')}
              </span>
              {managerApprovedBy && (
                <div className="mt-0.5 text-xs text-gray-500">
                  Duyệt bởi: {managerApprovedBy.name}
                </div>
              )}
            </div>
          );
        }

        // 4 đơn thường: Hiển thị ngày admin duyệt
        if (record.status === 'approved' && date) {
          const approverInfo =
            record.approved_by && typeof record.approved_by === 'object'
              ? record.approved_by
              : null;
          const approverName = approverInfo
            ? (approverInfo as { name: string }).name
            : null;

          return (
            <div>
              <span className="whitespace-nowrap text-gray-600">
                {dayjs(date).format('DD/MM/YYYY HH:mm')}
              </span>
              {approverName && (
                <div className="mt-0.5 text-xs text-gray-500">
                  Duyệt bởi: {approverName}
                </div>
              )}
            </div>
          );
        } else if (record.status === 'rejected' && date) {
          const approverInfo =
            record.approved_by && typeof record.approved_by === 'object'
              ? record.approved_by
              : null;
          const approverName = approverInfo
            ? (approverInfo as { name: string }).name
            : null;

          return (
            <div>
              <span className="whitespace-nowrap text-gray-600">
                {dayjs(date).format('DD/MM/YYYY HH:mm')}
              </span>
              {approverName && (
                <div className="mt-0.5 text-xs text-gray-500">
                  Từ chối bởi: {approverName}
                </div>
              )}
            </div>
          );
        }

        return <span className="text-sm text-gray-400">-</span>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        // Đếm số lượng buttons hiển thị
        const buttonCount =
          1 + // Luôn có button xem
          (canEdit(record) ? 1 : 0) +
          (canDelete(record) ? 1 : 0) +
          (!hideSignDelegation && canSignDelegation(record) ? 1 : 0) +
          (canApprove(record) ? 1 : 0) + // Duyệt
          (canReject(record) ? 1 : 0); // Từ chối

        return (
          <Space size="small">
            {buttonCount === 1 ? (
              // Chỉ có 1 button - hiển thị center
              <Tooltip title="Xem chi tiết">
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => onView?.(record)}
                />
              </Tooltip>
            ) : (
              // Nhiều buttons - hiển thị tất cả
              <>
                <Tooltip title="Xem chi tiết">
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => onView?.(record)}
                  />
                </Tooltip>

                {canEdit(record) && (
                  <Tooltip title="Chỉnh sửa">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => onEdit?.(record)}
                    />
                  </Tooltip>
                )}

                {canDelete(record) && (
                  <Tooltip title="Xóa">
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => onDelete?.(record)}
                    />
                  </Tooltip>
                )}

                {!hideSignDelegation && canSignDelegation(record) && (
                  <Tooltip title="Ký đơn ủy quyền">
                    <Button
                      type="text"
                      size="small"
                      style={{ color: '#1890ff' }}
                      icon={<FileTextOutlined />}
                      onClick={() => onSignDelegation?.(record)}
                    />
                  </Tooltip>
                )}

                {canApprove(record) && (
                  <Tooltip title="Duyệt đơn">
                    <Button
                      type="text"
                      size="small"
                      style={{ color: '#52c41a' }}
                      icon={<CheckOutlined />}
                      onClick={() => onApprove?.(record)}
                    />
                  </Tooltip>
                )}

                {canReject(record) && (
                  <Tooltip title="Từ chối">
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => onReject?.(record)}
                    />
                  </Tooltip>
                )}
              </>
            )}
          </Space>
        );
      }
    }
  ];

  return (
    <div className="overflow-x-auto">
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={pagination}
        scroll={{ x: 'max-content' }}
        size="middle"
        className="request-forms-table"
      />
    </div>
  );
};
