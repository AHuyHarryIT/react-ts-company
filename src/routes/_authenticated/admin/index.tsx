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

export const Route = createFileRoute('/_authenticated/admin/')({
  component: Dashboard,
  loader: fetchDashboardData
});

function Dashboard() {
  const { dashboardData, salaryTableData } = Route.useLoaderData();
  const { data: productData } = useQuery({
    queryKey: ['productChartData'],
    queryFn: () =>
      getMonthlyQuantities({ month: '07-2025', status: 1, limit: 0 })
  });
  const { authenticated } = Route.useRouteContext();
  const { user } = authenticated;
  const permissions = user?.permissions;
  const permission_titles = user?.permission_titles;
  console.log('authenticated', dashboardData);
  // Mapping widget theo permission key từ API
  type WidgetMapType = {
    view_total_employees: {
      title: string;
      icon: ReactNode;
      value: string;
      navLink: string;
    };
    view_attendance_history: {
      title: string;
      icon: ReactNode;
      value: string;
      navLink: string;
    };
    attendance_calculation_view: {
      title: string;
      icon: ReactNode;
      value: string;
      navLink: string;
    };
    roles_view: {
      title: string;
      icon: ReactNode;
      value: string;
      navLink: string;
    };
    salaries_view: {
      title: string;
      icon: ReactNode;
      value: string;
      navLink: string;
    };
    activity_schedule_view: {
      title: string;
      icon: ReactNode;
      value: string;
      navLink: string;
    };
    work_schedules_view: {
      title: string;
      icon: ReactNode;
      value: string;
      navLink: string;
    };
    products_view: {
      title: string;
      icon: ReactNode;
      value: string;
      navLink: string;
    };
    history_view: {
      title: string;
      icon: ReactNode;
      value: string;
      navLink?: string;
    };
    po_view: {
      title: string;
      icon: ReactNode;
      value: string;
      navLink: string;
    };
    stamps_view: {
      title: string;
      icon: ReactNode;
      value: string;
      navLink: string;
    };
  };

  const getWidgetByPermission = (permissionKey: keyof WidgetMapType) => {
    const widgetMap: WidgetMapType = {
      view_total_employees: {
        title: permission_titles?.view_total_employees || 'Tổng nhân viên',
        icon: <HiOutlineUserGroup />,
        value: dashboardData?.totalEmployee?.toLocaleString() || '0',
        navLink: '/admin/employees' as const
      },
      view_attendance_history: {
        title:
          permission_titles?.view_attendance_history ||
          'Bảng Lịch Sử Chấm Công',
        icon: <FaRegClock />,
        value: dashboardData?.totalRecord?.toLocaleString() || '0',
        navLink: '/admin/attendances/history' as const
      },
      attendance_calculation_view: {
        title:
          permission_titles?.attendance_calculation_view ||
          'Tính toán chấm công',
        icon: <IoCalculatorOutline />,
        value: dashboardData?.totalRecord?.toLocaleString() || '0',
        navLink: '/admin/attendance-calculation' as const
      },
      roles_view: {
        title: permission_titles?.roles_view || 'Tổng chức vụ',
        icon: <LiaUserTagSolid />,
        value: dashboardData?.totalRole?.toLocaleString() || '0',
        navLink: '/admin/roles' as const
      },
      salaries_view: {
        title: permission_titles?.salaries_view || 'Tổng bảng lương',
        icon: <LiaMoneyCheckAltSolid />,
        value: dashboardData?.totalSalary?.toLocaleString() || '0',
        navLink: '/admin/salaries' as const
      },
      activity_schedule_view: {
        title:
          permission_titles?.activity_schedule_view ||
          'Danh sách NV làm việc trong ngày',
        icon: <FiUserCheck />,
        value: dashboardData?.totalCheckEmployee?.toLocaleString() || '0',
        navLink: '/admin/activity-schedule' as const
      },
      work_schedules_view: {
        title: permission_titles?.work_schedules_view || 'Tổng lịch làm việc',
        icon: <LuCalendarFold />,
        value: dashboardData?.totalCalender?.toLocaleString() || '0',
        navLink: '/admin/work-schedules' as const
      },
      products_view: {
        title: permission_titles?.products_view || 'Tổng sản phẩm',
        icon: <LuBoxes />,
        value: dashboardData?.totalProduct?.toLocaleString() || '0',
        navLink: '/admin/products' as const
      },
      history_view: {
        title: permission_titles?.history_view || 'Tổng lịch sử',
        icon: <FaHistory />,
        value: dashboardData?.totalHistory?.toLocaleString() || '0',
        navLink: undefined
      },
      po_view: {
        title: permission_titles?.po_view || 'Danh sách PO',
        icon: <FaFileInvoiceDollar />,
        value: new Date().toLocaleDateString('vi-VN', {
          month: 'numeric',
          year: 'numeric'
        }),
        navLink: '/admin/purchase-orders' as const
      },
      stamps_view: {
        title: permission_titles?.stamps_view || 'Danh Sách Tem Cần In',
        icon: <FaPrint />,
        value: new Date().toLocaleDateString('vi-VN', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric'
        }),
        navLink: '/admin/stamps/history' as const
      }
    };

    return widgetMap[permissionKey];
  };

  // Tạo danh sách widget dựa trên permissions từ authenticated
  const listWidget = useMemo(() => {
    if (!permissions || !Array.isArray(permissions)) {
      return [];
    }

    return permissions
      .map((permission) =>
        getWidgetByPermission(permission as keyof WidgetMapType)
      )
      .filter((widget) => widget !== undefined); // Loại bỏ permissions không có widget
  }, [permissions, permission_titles, dashboardData]);

  // Kiểm tra quyền truy cập
  const hasPermission = (permissionKey: string) => {
    return permissions && permissions.includes(permissionKey);
  };

  // Tính toán layout responsive cho charts
  const showSalaryChart = hasPermission('salaries_view');
  const showProductChart = hasPermission('products_view');
  const chartColSpan =
    showSalaryChart && showProductChart ? 'xl:col-span-6' : 'xl:col-span-12';

  return (
    <>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Widget Section */}
        {listWidget.length > 0 && (
          <div className="col-span-12">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
              {listWidget.map((widget, index) => (
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

        {/* Charts Section */}
        {(showSalaryChart || showProductChart) && (
          <section className="col-span-12 grid grid-cols-12 gap-4 md:gap-6">
            {/* Salary Chart */}
            {showSalaryChart && (
              <div className={`col-span-12 ${chartColSpan}`}>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                  <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                    {permission_titles?.salary_chart ||
                      'Danh sách 10 bảng lương gần nhất'}
                  </h3>
                  <SalaryBarChart data={salaryTableData} />
                </div>
              </div>
            )}

            {/* Product Chart */}
            {showProductChart && (
              <div className={`col-span-12 ${chartColSpan}`}>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                  <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                    {permission_titles?.product_chart ||
                      'Danh sách 10 sản phẩm sản xuất nhiều nhất'}
                  </h3>
                  <ProductChart data={productData || []} />
                </div>
              </div>
            )}
          </section>
        )}

        {/* Empty State - khi user không có permission nào */}
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

// FIXME: SalaryBarChart component to visualize salary data
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

// FIXME: ProductBarChart component to visualize calendar data
type ProductDataType = {
  product: number;
  quantity: number;
};
export function ProductChart({ data }: { data: TotalMonthQuantityType[] }) {
  // Lấy dữ liệu, bỏ null và chuẩn hóa
  const chartData = data
    .map((item) => ({
      product: `SP-${item.product_id}`, // tên hiển thị
      quantity: item.totalQuan || 0
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const config = {
    data: chartData,
    isGroup: true, // Bật Grouped Column Chart
    xField: 'product', // Tên sản phẩm ở trục X
    yField: 'quantity', // Số lượng ở trục Y
    dodgePadding: 2,
    legend: { position: 'top' },
    label: {
      position: 'top', // label trên đầu cột
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
