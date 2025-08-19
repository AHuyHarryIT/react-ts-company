import { createFileRoute, LinkProps } from '@tanstack/react-router';

import DashboardWidget from '@components/dashboard/DashboardWidget';
import { fetchDashboardData } from '@services/DashboardService';

import { SalaryType } from '@/types/salaryType';
import { TotalMonthQuantityType } from '@/types/totalMonthQuantityType';
import { TrophyOutlined, WalletOutlined } from '@ant-design/icons';
import { Bar, Column } from '@ant-design/plots';
import { getMonthlyQuantities } from '@services/TotalQuantityService';
import { useQuery } from '@tanstack/react-query';
import { Card } from 'antd';
import { ReactNode, useMemo } from 'react';
import { FaHistory, FaRegClock } from 'react-icons/fa';
import { FaFileInvoiceDollar, FaPrint } from 'react-icons/fa6';
import { FiUserCheck } from 'react-icons/fi';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { IoCalculatorOutline } from 'react-icons/io5';
import { LiaMoneyCheckAltSolid, LiaUserTagSolid } from 'react-icons/lia';
import { LuBoxes, LuCalendarFold } from 'react-icons/lu';
import { useAuth } from '@hooks/useAuth';
import { Permission } from '@/types/permissionType';

export const Route = createFileRoute('/_authenticated/admin/')({
  component: Dashboard,
  loader: fetchDashboardData
});

function Dashboard() {
  const { dashboardData, salaryTableData } = Route.useLoaderData();

  // build current MM-YYYY for the product chart query
  const now = new Date();
  const monthParam = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

  const { data: productData } = useQuery({
    queryKey: ['productChartData', monthParam],
    queryFn: () =>
      getMonthlyQuantities({ month: monthParam, status: 1, limit: 0 })
  });

  const { user } = useAuth();
  const permissions = useMemo(() => user?.permissions ?? [], [user]);

  const isAdminType = (t: Permission['type']) => {
    return ['admin', 'both'].includes(t.toLowerCase());
  };

  type WidgetMapType = {
    [key: string]: {
      icon: ReactNode;
      value: string;
      navLink?: string;
    };
  };

  type WidgetType = {
    title: string;
    icon: ReactNode;
    value: string;
    navLink?: string;
  };

  // Function để viết hoa chữ cái đầu của mỗi từ
  const capitalizeWords = (str: string) => {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const widgetMap: WidgetMapType = {
    view_total_employees: {
      icon: <HiOutlineUserGroup />,
      value: dashboardData?.totalEmployee?.toLocaleString() || '0',
      navLink: '/admin/employees' as const
    },
    view_attendance_history: {
      icon: <FaRegClock />,
      value: dashboardData?.totalRecord?.toLocaleString() || '0',
      navLink: '/admin/attendances/history' as const
    },
    view_attendance_calculation: {
      icon: <IoCalculatorOutline />,
      value: dashboardData?.totalRecord?.toLocaleString() || '0',
      navLink: '/admin/attendance-calculation' as const
    },
    view_total_positions: {
      icon: <LiaUserTagSolid />,
      value: dashboardData?.totalRole?.toLocaleString() || '0',
      navLink: '/admin/roles' as const
    },
    view_production_plan: {
      icon: <LiaMoneyCheckAltSolid />,
      value: dashboardData?.totalSalary?.toLocaleString() || '0',
      navLink: '/admin/salaries' as const
    },
    view_today_employees: {
      icon: <FiUserCheck />,
      value: dashboardData?.totalCheckEmployee?.toLocaleString() || '0',
      navLink: '/admin/activity-schedule' as const
    },
    view_total_schedule: {
      icon: <LuCalendarFold />,
      value: dashboardData?.totalCalender?.toLocaleString() || '0',
      navLink: '/admin/work-schedules' as const
    },
    view_total_products: {
      icon: <LuBoxes />,
      value: dashboardData?.totalProduct?.toLocaleString() || '0',
      navLink: '/admin/products' as const
    },
    view_total_history: {
      icon: <FaHistory />,
      value: dashboardData?.totalHistory?.toLocaleString() || '0'
    },
    view_po_list: {
      icon: <FaFileInvoiceDollar />,
      value: `Tháng ${new Date().getMonth() + 1}`,
      navLink: '/admin/purchase-orders' as const
    },
    view_labels_to_print: {
      icon: <FaPrint />,
      value: `Tháng ${new Date().getMonth() + 1}`,
      navLink: '/admin/stamps/history' as const
    },
    view_export_warehouse: {
      icon: <FaPrint />,
      value: `Tháng ${new Date().getMonth() + 1}`,
      navLink: '/employee/scan/storage' as const
    },

    view_total_salary: {
      icon: <LiaMoneyCheckAltSolid />,
      value: dashboardData?.totalSalary?.toLocaleString() || '0',
      navLink: '/admin/salaries' as const
    }
  };

  const homePermissions = useMemo(() => {
    const filtered = permissions
      .filter((p) => {
        const displayArea = p.display_area.toLowerCase();
        const isAdmin = isAdminType(p.type);
        return displayArea === 'home' && isAdmin;
      })
      .sort((a, b) => Number(a.id) - Number(b.id)); // Sắp xếp theo id tăng dần
    return filtered;
  }, [permissions]);

  const listWidget = useMemo(() => {
    const widgets = homePermissions
      .map((p) => {
        const baseWidget = widgetMap[p.key];
        if (baseWidget) {
          const widget: WidgetType = {
            ...baseWidget,
            title: capitalizeWords(p.name) // Sử dụng tên từ permission và viết hoa mỗi từ
          };
          return widget;
        }
        return null;
      })
      .filter((w): w is WidgetType => Boolean(w));
    return widgets;
  }, [homePermissions, dashboardData]);

  // Chỉ coi là có quyền nếu permission đúng key và type ∈ {admin, both}
  const hasPermission = (permissionKey: string) =>
    permissions.some((p) => isAdminType(p.type) && p.key === permissionKey);

  // giữ logic cũ cho chart
  const showSalaryChart = hasPermission('salaries_view');
  const showProductChart = hasPermission('products_view');

  const chartColSpan =
    showSalaryChart && showProductChart ? 'xl:col-span-6' : 'xl:col-span-12';

  return (
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
              <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                  Danh sách 10 bảng lương gần nhất
                </h3>
                <SalaryBarChart data={salaryTableData} />
              </div>
            </div>
          )}

          {showProductChart && (
            <div className={`col-span-12 ${chartColSpan}`}>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                  Danh sách 10 sản phẩm sản xuất nhiều nhất
                </h3>
                <ProductChart data={productData || []} />
              </div>
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
  );
}

// ==== Charts ====

type salaryDataType = {
  month: string;
  total: number;
};

export function SalaryBarChart({ data }: { data: SalaryType[] }) {
  const chartData: salaryDataType[] = data
    .map((item) => ({
      month: item.title.replace('Bảng Lương Tháng ', ''),
      total: item.total
    }))
    .reverse();

  const config = {
    data: chartData,
    xField: 'month',
    yField: 'total',
    axis: {
      y: {
        labelFormatter: (v: number) => v.toLocaleString('vi-VN') + ' ₫',
        title: 'Tổng lương'
      }
    },
    label: {
      text: (d: salaryDataType) => d.total.toLocaleString('vi-VN') + ' ₫',
      textBaseline: 'bottom'
    },
    tooltip: {
      title: (d: salaryDataType) => d.month,
      items: [
        {
          field: 'total',
          name: 'Tổng lương',
          valueFormatter: (value: number) =>
            value.toLocaleString('vi-VN') + ' ₫'
        }
      ]
    }
  };

  return (
    <Card
      title={
        <>
          <WalletOutlined /> Tổng quan bảng lương
        </>
      }
    >
      <Column {...config} />
    </Card>
  );
}

// Product chart

type ProductDataType = {
  product: string;
  quantity: number;
};

export function ProductChart({ data }: { data: TotalMonthQuantityType[] }) {
  const chartData: ProductDataType[] = (data || [])
    .map((item) => ({
      product: `SP-${item.product_id}`,
      quantity: item.totalQuan || 0
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const config = {
    data: chartData,
    isGroup: false, // single series bar chart
    xField: 'product',
    yField: 'quantity',
    legend: { position: 'top' },
    label: {
      position: 'top',
      style: { fill: '#000', fontSize: 12 },
      formatter: (d: ProductDataType) => d.quantity.toLocaleString('en-US')
    },
    tooltip: {
      title: (d: ProductDataType) => d.product,
      items: [
        {
          field: 'quantity',
          name: 'Số lượng',
          valueFormatter: (value: number) => value.toLocaleString('en-US')
        }
      ]
    }
  };

  return (
    <Card
      title={
        <>
          <TrophyOutlined /> So sánh sản phẩm theo nhóm
        </>
      }
    >
      <Bar {...config} />
    </Card>
  );
}
