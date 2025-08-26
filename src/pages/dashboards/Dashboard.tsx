import { LinkProps } from '@tanstack/react-router';

import DashboardWidget from '@components/dashboard/DashboardWidget';
import { fetchDashboardData } from '@services/DashboardService';

import { Permission } from '@/types/permissionType';
import { SlideCarousel } from '@components/SlideCarousel';
import { useAuth } from '@hooks/useAuth';
import { getMonthlyQuantities } from '@services/TotalQuantityService';
import { fetchImages } from '@services/UploadService';
import { useQuery } from '@tanstack/react-query';
import { isAdmin } from '@utils/authUtil';
import { ReactNode, useMemo } from 'react';
import {
  FaFileContract,
  FaHistory,
  FaListAlt,
  FaMoneyCheckAlt,
  FaPrint,
  FaRegClock,
  FaTruck,
  FaUserCircle,
  FaUserTie
} from 'react-icons/fa';
import { FiUserCheck } from 'react-icons/fi';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { IoCalculatorOutline } from 'react-icons/io5';
import { LuBoxes, LuCalendarFold, LuLogOut, LuScanLine } from 'react-icons/lu';
import { ProductChart } from './ProductChart';
import { SalaryChart } from './SalaryChart';

export default function Dashboard() {
  const { user } = useAuth();
  const admin = isAdmin(user?.role.name || '');

  const permissions = useMemo(() => user?.permissions ?? [], [user]);

  const { data: dashboardResponse } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
    enabled: admin // Only fetch if the user is an admin
  });

  const dashboardData = dashboardResponse?.dashboardData;
  const salaryTableData = dashboardResponse?.salaryTableData ?? [];

  // build current MM-YYYY for the product chart query
  const now = new Date();
  const monthParam = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

  const { data: productData } = useQuery({
    queryKey: ['productChartData', monthParam],
    queryFn: () =>
      getMonthlyQuantities({
        month: monthParam,
        status: 1,
        limit: 0,
        include: ['product']
      }),
    enabled: admin // Only fetch if the user is an admin
  });

  const isAdminType = (t: Permission['type']) => {
    return ['admin', 'both'].includes(t.toLowerCase());
  };

  type WidgetMapType = {
    [key: string]: {
      icon: ReactNode;
      value?: string;
      navLink?: LinkProps['to'];
    };
  };

  type WidgetType = {
    title: string;
    icon: ReactNode;
    value?: string;
    navLink?: LinkProps['to'];
  };

  // Function để viết hoa chữ cái đầu của mỗi từ
  const capitalizeWords = (str: string) => {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const adminWidgetMap: WidgetMapType = {
    // Tổng số nhân viên
    view_total_employees: {
      icon: <HiOutlineUserGroup />,
      value: dashboardData?.totalEmployee?.toLocaleString() || '0',
      navLink: '/admin/employees'
    },

    // Lịch sử chấm công
    view_attendance_history: {
      icon: <FaRegClock />,
      value: dashboardData?.totalRecord?.toLocaleString() || '0',
      navLink: '/admin/attendances/history'
    },

    // Tính công
    view_attendance_calculation: {
      icon: <IoCalculatorOutline />,
      value: dashboardData?.totalRecord?.toLocaleString() || '0',
      navLink: '/admin/attendances/record'
    },

    // Tổng số chức vụ
    view_total_positions: {
      icon: <FaUserTie />,
      value: dashboardData?.totalRole?.toLocaleString() || '0',
      navLink: '/admin/roles'
    },

    // Kế hoạch sản xuất
    // view_production_plan: {
    //   icon: <FaClipboardList />,
    //   value: dashboardData?.totalSalary?.toLocaleString() || '0',
    //   navLink: '/admin/salaries'
    // },

    // Nhân viên hôm nay
    view_today_employees: {
      icon: <FiUserCheck />,
      value: dashboardData?.totalCheckEmployee?.toLocaleString() || '0',
      navLink: '/activity-schedule'
    },

    // Tổng số lịch làm việc
    view_total_schedule: {
      icon: <LuCalendarFold />,
      value: dashboardData?.totalCalender?.toLocaleString() || '0',
      navLink: '/work-schedules'
    },

    // Tổng sản phẩm
    view_total_products: {
      icon: <LuBoxes />,
      value: dashboardData?.totalProduct?.toLocaleString() || '0',
      navLink: '/admin/products'
    },

    // Tổng lịch sử
    // view_total_history: {
    //   icon: <FaHistory />,
    //   value: dashboardData?.totalHistory?.toLocaleString() || '0'
    // },

    // Purchase Order (PO)
    view_po_list: {
      icon: <FaFileContract />,
      value: `Tháng ${new Date().getMonth() + 1}`,
      navLink: '/admin/check-po'
    },

    // Tổng bảng lương
    view_total_salary: {
      icon: <FaMoneyCheckAlt />,
      value: dashboardData?.totalSalary?.toLocaleString() || '0',
      navLink: '/admin/salaries'
    }
  };

  // Employee Widget Map
  const empWidgetMap: WidgetMapType = {
    // Lịch sử chấm công
    view_attendance_sheet_history: {
      icon: <FaHistory />,
      navLink: '/employee/attendances/history'
    },

    // Bảng tính giờ làm
    view_work_time_calc_sheet: {
      icon: <FaRegClock />,
      navLink: '/employee/attendances/calculate'
    },

    // Lịch làm việc cá nhân
    view_work_schedule: {
      icon: <LuCalendarFold />,
      navLink: '/employee/schedules'
    },

    // Bảng lương
    view_salary_sheet: {
      icon: <FaMoneyCheckAlt />,
      navLink: '/employee/salaries'
    },

    // Lịch trình nhân viên
    view_employee_schedule: {
      icon: <HiOutlineUserGroup />,
      navLink: '/work-schedules'
    },

    // Hoạt động hàng ngày
    view_daily_activities: {
      icon: <FiUserCheck />,
      navLink: '/activity-schedule'
    },

    // Scan
    scan: {
      icon: <LuScanLine />,
      navLink: '/scan'
    },

    // Chọn sản phẩm active
    select_active_product: {
      icon: <LuBoxes />,
      navLink: '/employee/todo/add-product'
    },

    // Lịch sử nhập hàng trong ngày
    view_daily_import_history: {
      icon: <FaListAlt />,
      navLink: '/employee/todo/history'
    },

    // Yêu cầu in tem
    request_label_printing: {
      icon: <FaPrint />,
      navLink: '/employee/stamps/request'
    },

    // Thông tin tài khoản
    view_account_info: {
      icon: <FaUserCircle />,
      navLink: '/profile'
    },

    // Đăng xuất
    logout: {
      icon: <LuLogOut />
      // navLink: '/log'
    }
  };

  // Widgets dùng chung cho cả admin & employee (type = both)
  const commonWidgetMap: WidgetMapType = {
    // Danh sách tem cần in
    view_labels_to_print: {
      icon: <FaPrint />,
      value: `Tháng ${new Date().getMonth() + 1}`,
      navLink: '/stamps/history'
    },

    // Kho xuất hàng
    view_export_warehouse: {
      icon: <FaTruck />,
      value: `Tháng ${new Date().getMonth() + 1}`,
      navLink: '/scan/storage'
    }
  };

  // Cho phép cả admin, both, employee
  const isAllowedType = (t: Permission['type']) => {
    return ['admin', 'both', 'employee'].includes(t.toLowerCase());
  };

  const homePermissions = useMemo(() => {
    const filtered = permissions
      .filter((p) => {
        const displayArea = p.display_area?.toLowerCase();
        const allowed = isAllowedType(p.type);
        return displayArea === 'home' && allowed;
      })
      .sort((a, b) => Number(a.id) - Number(b.id));
    return filtered;
  }, [permissions]);

  const listWidget = useMemo(() => {
    const widgets = homePermissions
      .map((p) => {
        const baseWidget = admin
          ? adminWidgetMap[p.key] || commonWidgetMap[p.key]
          : empWidgetMap[p.key] || commonWidgetMap[p.key];

        if (baseWidget) {
          let widget: WidgetType = {
            ...baseWidget,
            title: capitalizeWords(p.name)
          };
          if (!admin && commonWidgetMap[p.key]) {
            widget = {
              icon: widget.icon,
              title: widget.title,
              navLink: widget.navLink
            };
          }

          return widget;
        }
        return null;
      })
      .filter((w): w is WidgetType => Boolean(w));
    // Sắp xếp widgets theo thứ tự của homePermissions (permissions đã sort)
    return widgets;
  }, [homePermissions, dashboardData, admin]);

  // giữ logic cũ cho chart
  const hasPermission = (permissionKey: string) =>
    permissions.some((p) => isAdminType(p.type) && p.key === permissionKey);

  const showSalaryChart = hasPermission('view_chart_salary');
  const showProductChart = hasPermission('view_chart_product');

  const chartColSpan =
    showSalaryChart && showProductChart ? 'xl:col-span-6' : 'xl:col-span-12';

  const { data: imageList } = useQuery({
    queryKey: ['images'],
    queryFn: () =>
      fetchImages({
        limit: 0
      })
  });
  return (
    <>
      <SlideCarousel images={imageList?.data || []} />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {listWidget.length > 0 && (
          <div className="col-span-12">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
              {listWidget.map((widget: WidgetType, index: number) => (
                <DashboardWidget
                  key={`dashboard-widget-${index}`}
                  title={widget.title}
                  icon={widget.icon}
                  value={widget.value}
                  navLink={widget.navLink as LinkProps['to']}
                />
              ))}
            </div>
          </div>
        )}

        {(showSalaryChart || showProductChart) && (
          <section className="col-span-12 grid grid-cols-12 gap-4 md:gap-6">
            {showSalaryChart && (
              <div className={`col-span-12 ${chartColSpan}`}>
                <SalaryChart data={salaryTableData} />
              </div>
            )}

            {showProductChart && (
              <div className={`col-span-12 ${chartColSpan}`}>
                <ProductChart data={productData || []} />
              </div>
            )}
          </section>
        )}

        {listWidget.length === 0 && !showSalaryChart && !showProductChart && (
          <div className="col-span-12">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-gray-400 dark:text-gray-500">
                <svg
                  className="mx-auto mb-4 h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                Chào mừng bạn đến Dashboard
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Hệ thống đang chuẩn bị quyền truy cập cho tài khoản của bạn.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
