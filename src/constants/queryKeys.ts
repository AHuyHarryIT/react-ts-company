/**
 * Centralized Query Keys - đảm bảo cache hit đúng,
 * tránh duplicate fetch cho cùng data.
 *
 * Cách dùng:
 *   useQuery({ queryKey: [QUERY_KEYS.PRODUCTS, filters], ... })
 *   queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] })
 */
export const QUERY_KEYS = {
  // ── Admin ──
  PRODUCTS: 'products',
  MONTHS: 'months',
  EMPLOYEES: 'employees',
  ROLES: 'roles',
  SALARIES: 'fetchSalaries',
  ATTENDANCES: 'attendances',
  ATTENDANCE_RECORDS: 'attendance-records',
  SCHEDULES: 'workSchedules',
  SCHEDULE_CATEGORIES: 'workScheduleCategories',
  DAILY_SCHEDULE: 'dailySchedule',
  STAMPS: 'stamps',
  STAMP_HISTORY: 'stamp-history',
  HISTORY: 'history',
  RBAC_DATA: 'rbac-data',
  PERMISSIONS_LIST: 'permissions-list',
  ADMIN_USERS: 'admin-users',
  FEEDBACKS: 'admin-feedbacks',
  NOTIFICATIONS: 'notifications',
  IMAGES: 'images',

  // ── Employee ──
  MY_FEEDBACKS: 'my-feedbacks',
  EMPLOYEE_REQUEST_FORMS: 'employee-request-forms',

  // ── Dashboard ──
  DASHBOARD: 'dashboardData',
  PRODUCT_CHART: 'productChartData',

  // ── Purchase Orders ──
  PURCHASE_ORDERS: 'purchaseOrders',
  PO_HISTORY: 'po-history',

  // ── Stock ──
  STOCK_TRANSACTIONS: 'stockTransactions',
  CURRENT_STOCK: 'currentStock',

  // ── Request Forms ──
  REQUEST_FORMS: 'request-forms',
  REQUEST_STATISTICS: 'request-statistics',

  // ── Form data (detail/edit) ──
  FORM_DATA: 'form-data'
} as const;

export type QueryKeyType = (typeof QUERY_KEYS)[keyof typeof QUERY_KEYS];
