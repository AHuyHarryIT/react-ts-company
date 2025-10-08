// Form và Modal Components - Tạo và chỉnh sửa đơn
export { CreateEditModal } from './CreateEditModal';
export { AdminActionModal } from './AdminModals';
export { ConfirmDeleteModal } from './ConfirmDeleteModal';
export { DelegationSignModal } from './DelegationSignModal';

// Table và Filter - Hiển thị danh sách và bộ lọc
export { DataTable } from './DataTable';
export { FilterPanel } from './FilterPanel';

// Chi tiết đơn - Hiển thị thông tin chi tiết
export { DetailView } from './DetailView';

// Form Fields - Render fields cho form
export { FormFieldsRenderer } from './FormFieldsRenderer';

// Utilities - Context và helper components
export {
  EmployeeSelectionProvider,
  useEmployeeSelection,
  EmployeeNameDisplay,
  type SelectedEmployee
} from './Utilities';

// Exports with original names for backward compatibility
export { CreateEditModal as RequestFormCreateModal } from './CreateEditModal';
export { DataTable as RequestFormDataTable } from './DataTable';
export { FilterPanel as RequestFormFilterPanel } from './FilterPanel';
export { DetailView as RequestFormDetailView } from './DetailView';
export { FormFieldsRenderer as RequestFormFieldsRenderer } from './FormFieldsRenderer';
export { ConfirmDeleteModal as DeleteConfirmModal } from './ConfirmDeleteModal';
