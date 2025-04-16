import { message } from 'antd';
import { useEffect, useState } from 'react';

import {
  DashboardDataType,
  SalaryTableType,
  WorkCalendarTableType,
} from '@/types/dashboardType';
import DashboardWidget, {
  WidgetProps,
} from '@components/dashboard/DashboardWidget';
import { SalaryTable } from '@components/dashboard/SalaryTable';
import { WorkCalendarTable } from '@components/dashboard/WorkCalendarTable';
import { fetchDashboardData } from '@services/DashboardService';
import { headTitle } from '@utils/headMeta';

import { FaHistory, FaRegClock } from 'react-icons/fa';
import { FaFileInvoiceDollar, FaPrint } from 'react-icons/fa6';
import { FiUserCheck } from 'react-icons/fi';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { IoCalculatorOutline } from 'react-icons/io5';
import { LiaMoneyCheckAltSolid, LiaUserTagSolid } from 'react-icons/lia';
import { LuBoxes, LuCalendarFold, LuClipboardList } from 'react-icons/lu';

function Dashboard() {
  headTitle('Dashboard');
  const [salaryTable, setSalaryTable] = useState<SalaryTableType[]>([]);
  const [workCalendarTable, setWorkCalendarTable] = useState<
    WorkCalendarTableType[]
  >([]);
  const [dashboardData, setDashboardData] = useState<DashboardDataType>({
    totalEmployee: 0,
    totalRole: 0,
    totalSalary: 0,
    totalCalender: 0,
    totalProduct: 0,
    totalHistory: 0,
    totalPlan: 0,
    totalRecord: 0,
    totalCheckEmployee: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { dashboardData, salaryTableData, workCalendarTableData } =
          await fetchDashboardData();
        setDashboardData(dashboardData);
        setSalaryTable(salaryTableData);
        setWorkCalendarTable(workCalendarTableData);
      } catch (error) {
        message.error(String(error));
        console.error('Failed to fetch dashboard data');
      }
    };
    fetchData();
  }, []);

  const listWidget: WidgetProps[] = [
    {
      title: 'Tổng nhân viên',
      icon: <HiOutlineUserGroup />,
      value: dashboardData?.totalEmployee.toLocaleString(),
    },
    {
      title: 'Bảng Lịch Sử Chấm Công',
      icon: <FaRegClock />,
      value: dashboardData?.totalRecord.toLocaleString(),
    },
    {
      title: 'Bảng Tính Toán Chấm Công',
      icon: <IoCalculatorOutline />,
      value: new Date().toLocaleDateString('vi-VN', {
        month: 'numeric',
        year: 'numeric',
      }),
    },
    {
      title: 'Tổng chức vụ',
      icon: <LiaUserTagSolid />,
      value: dashboardData?.totalRole.toLocaleString(),
    },
    {
      title: 'Kế hoạch sản xuất',
      icon: <LuClipboardList />,
      value: dashboardData?.totalPlan.toLocaleString(),
    },
    {
      title: 'Tổng bảng lương',
      icon: <LiaMoneyCheckAltSolid />,
      value: dashboardData?.totalSalary.toLocaleString(),
    },
    {
      title: 'Danh sách NV làm việc trong ngày',
      icon: <FiUserCheck />,
      value: dashboardData?.totalCheckEmployee.toLocaleString(),
    },
    {
      title: 'Tổng lịch làm việc',
      icon: <LuCalendarFold />,
      value: dashboardData?.totalCalender.toLocaleString(),
    },
    {
      title: 'Tổng sản phẩm',
      icon: <LuBoxes />,
      value: dashboardData?.totalProduct.toLocaleString(),
    },
    {
      title: 'Tổng lịch sử',
      icon: <FaHistory />,
      value: dashboardData?.totalHistory.toLocaleString(),
    },
    {
      title: 'Danh sách PO',
      icon: <FaFileInvoiceDollar />,
      value: new Date().toLocaleDateString('vi-VN', {
        month: 'numeric',
        year: 'numeric',
      }),
    },
    {
      title: 'Danh Sách Tem Cần In',
      icon: <FaPrint />,
      value: new Date().toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      }),
    },
  ];

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <span className="col-span-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {listWidget.map((item, index) => (
            <DashboardWidget
              key={`dashboard-widget-${index}`}
              title={item.title}
              icon={item.icon}
              value={item.value}
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
            <SalaryTable data={salaryTable} />
          </div>
        </div>
        <div className="col-span-12 xl:col-span-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Danh sách 10 bảng lương gần nhất
            </h3>
            <WorkCalendarTable data={workCalendarTable} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
