import { MenuProps } from 'antd';
import type { IconType } from 'react-icons';
import { CiBoxes } from 'react-icons/ci';
import {
  FaBox,
  FaBriefcase,
  FaCalendarAlt,
  FaCalendarCheck,
  FaCamera,
  FaCircle,
  FaClipboardList,
  FaEnvelope,
  FaHistory,
  FaMoneyCheckAlt,
  FaPrint,
  FaUser,
  FaUsersCog
} from 'react-icons/fa';
import { MdToday } from 'react-icons/md';
import { FiUserCheck } from 'react-icons/fi';
import { HiOutlineHome } from 'react-icons/hi';
import { PermissionIconType } from './permissionType';
import { LinkProps } from '@tanstack/react-router';

// ----- Types -----

export interface SidebarItem {
  id: number;
  permission_id: number;
  key: string; // << dùng key này để map icon cho submenu
  title: string;
  icon?: string | IconType; // << có thể là chuỗi FA hoặc IconType
  path: string;
}

export type MenuItem = Required<MenuProps>['items'][number];

// ----- Icon mặc định -----
export const DefaultIcon = FaCircle;

// ----- Map icon cho các Permission (mục đơn & parent) -----
export const permissionIconMap: PermissionIconType = {
  // Admin
  view_dashboard: HiOutlineHome,
  view_products: CiBoxes,
  view_today_employees: FiUserCheck,
  view_po_list: FaClipboardList,
  view_history: FaHistory,
  view_schedule: FaCalendarAlt,
  view_schedule_categories: FaBriefcase,
  view_salary_total: FaMoneyCheckAlt,
  view_employee_management: FaUsersCog, // parent
  view_label_management: FaPrint, // parent
  view_attendance: FaCalendarCheck, // parent

  // Request Forms
  view_request_forms: FaClipboardList,
  approve_request_forms: FaClipboardList,

  // Employee
  view_employee_schedule: FaCalendarAlt,
  view_salary: FaMoneyCheckAlt,
  view_activity_history: FaHistory,
  request_label: FaEnvelope,
  storage_export_product: FaBox,
  scan: FaCamera,
  view_account_info: FaUser,
  employees_view_attendance: FaCalendarCheck, // parent
  employees_select_products: CiBoxes, // parent
  employees_view_label: FaPrint, // parent
  create_request_forms: FaClipboardList,

  //both
  view_team_schedule: FaCalendarAlt, // lịch nhóm
  view_today_activity: MdToday // hoạt động hôm nay
};

export type PermissionPathType = {
  [key: string]: LinkProps['to'];
};

export const permissionPathMap: PermissionPathType = {
  // Admin
  view_dashboard: '/',
  view_products: '/admin/products',
  view_today_employees: '/activity-schedule',
  view_po_list: '/admin/check-po',
  view_salary_total: '/admin/salaries',
  view_history: '/admin/history',
  view_roles: '/admin/roles',
  view_employees: '/admin/employees',
  create_pack_label: '/stamps/bag',
  create_box_label: '/stamps/box',
  view_label_history: '/stamps/history',
  view_attendance_history: '/admin/attendances/history',
  view_attendance_calculation: '/admin/attendances/record',
  view_schedule: '/work-schedules',
  view_schedule_categories: '/admin/work-schedule-categories',

  // Request Forms - cho phép admin và special users
  view_request_forms: '/request-forms',

  //Employee
  view_employee_schedule: '/employee/schedules',
  view_salary: '/employee/salaries',
  attendance: '/employee/attendances/history',
  attendance_calculation: '/employee/attendances/calculate',
  scan: '/scan',
  storage_export_product: '/scan/storage',
  view_team_schedule: '/work-schedules',
  view_today_activity: '/activity-schedule',
  request_label: '/employee/stamps/request',
  select_products_todo: '/employee/todo/add-product',
  input_quantity: '/employee/todo/update-quantity',
  input_quantity_error: '/employee/todo/update-quantity-error',
  history_input_quantity: '/employee/todo/history',
  view_activity_history: '/employee/activity-schedule',
  create_request_forms: '/employee/request-forms'
};
