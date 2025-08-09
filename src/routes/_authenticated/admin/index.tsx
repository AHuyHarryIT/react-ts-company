import { createFileRoute } from '@tanstack/react-router';

import DashboardWidget, {
  WidgetProps
} from '@components/dashboard/DashboardWidget';
import { fetchDashboardData } from '@services/DashboardService';

import { SalaryType } from '@/types/salaryType';
import { TotalMonthQuantityType } from '@/types/totalMonthQuantityType';
import { TrophyOutlined, WalletOutlined } from '@ant-design/icons';
import { Bar, Column } from '@ant-design/plots';
import { getMonthlyQuantities } from '@services/TotalQuantityService';
import { useQuery } from '@tanstack/react-query';
import { Card } from 'antd';
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
  const listWidget: WidgetProps[] = [
    {
      title: 'Tổng nhân viên',
      icon: <HiOutlineUserGroup />,
      value: dashboardData?.totalEmployee.toLocaleString(),
      navLink: '/admin/employees'
    },
    {
      title: 'Bảng Lịch Sử Chấm Công',
      icon: <FaRegClock />,
      value: dashboardData?.totalRecord.toLocaleString(),
      navLink: '/admin/attendances/history'
    },
    {
      title: 'Bảng Tính Toán Chấm Công',
      icon: <IoCalculatorOutline />,
      value: new Date().toLocaleDateString('vi-VN', {
        month: 'numeric',
        year: 'numeric'
      }),
      navLink: '/admin/attendances/record'
    },
    {
      title: 'Tổng chức vụ',
      icon: <LiaUserTagSolid />,
      value: dashboardData?.totalRole.toLocaleString(),
      navLink: '/admin/roles'
    },
    // {
    //   title: 'Kế hoạch sản xuất',
    //   icon: <LuClipboardList />,
    //   value: dashboardData?.totalPlan.toLocaleString(),
    // },
    {
      title: 'Tổng bảng lương',
      icon: <LiaMoneyCheckAltSolid />,
      value: dashboardData?.totalSalary.toLocaleString(),
      navLink: '/admin/salaries'
    },
    {
      title: 'Danh sách NV làm việc trong ngày',
      icon: <FiUserCheck />,
      value: dashboardData?.totalCheckEmployee.toLocaleString(),
      navLink: '/admin/activity-schedule'
    },
    {
      title: 'Tổng lịch làm việc',
      icon: <LuCalendarFold />,
      value: dashboardData?.totalCalender.toLocaleString(),
      navLink: '/admin/work-schedules'
    },
    {
      title: 'Tổng sản phẩm',
      icon: <LuBoxes />,
      value: dashboardData?.totalProduct.toLocaleString(),
      navLink: '/admin/products'
    },
    {
      title: 'Tổng lịch sử',
      icon: <FaHistory />,
      value: dashboardData?.totalHistory.toLocaleString()
    },
    {
      title: 'Danh sách PO',
      icon: <FaFileInvoiceDollar />,
      value: new Date().toLocaleDateString('vi-VN', {
        month: 'numeric',
        year: 'numeric'
      })
    },
    {
      title: 'Danh Sách Tem Cần In',
      icon: <FaPrint />,
      value: new Date().toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      }),
      navLink: '/admin/stamps/history'
    }
  ];

  return (
    <>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <span className="col-span-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
            {listWidget.map((item, index) => (
              <DashboardWidget
                key={`dashboard-widget-${index}`}
                title={item.title}
                icon={item.icon}
                value={item.value}
                navLink={item.navLink}
              />
            ))}
          </div>
        </span>
        <section className="col-span-12 grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 xl:col-span-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Danh sách 10 bảng lương gần nhất
              </h3>
              <SalaryBarChart data={salaryTableData} />
            </div>
          </div>
          <div className="col-span-12 xl:col-span-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Danh sách 10 sản phẩm sản xuất nhiều nhất
              </h3>
              <ProductChart data={productData || []} />
            </div>
          </div>
        </section>
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
