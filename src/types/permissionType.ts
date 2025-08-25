import { IconType } from 'react-icons';
import { SidebarItem } from './menuItem';

export type PermissionKey =
  | 'view_dashboard'
  | 'view_products'
  | 'view_today_employees'
  | 'view_po_list'
  | 'view_history'
  | 'view_schedule'
  | 'view_schedule_categories'
  | 'view_employee_management'
  | 'view_label_management'
  | 'view_attendance'
  | 'view_employee_schedule'
  | 'view_salary_total'
  | 'view_salary'
  | 'view_activity_history'
  | 'request_label'
  | 'storage_export_product'
  | 'scan'
  | 'view_account_info'
  | 'employees_view_attendance'
  | 'employees_select_products'
  | 'employees_view_label';

export type PermissionIconType = {
  [key: string]: IconType;
};

export type Permission = {
  id: number;
  key: string;
  name: string;
  type: 'admin' | 'employee' | 'both';
  display_area: string;
  pivot?: {
    role_id: number;
    permission_id: number;
  };
  sidebar_items: SidebarItem[];
};
