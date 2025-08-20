import { Button, DatePicker, Tabs, TabsProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';

import { DailyTable } from '@components/check-po/DailyTable';
import { ErrorTable } from '@components/check-po/ErrorTable';
import { WeekTable } from '@components/check-po/WeekTable';
import ComponentCard from '@components/common/ComponentCard';
import { getWeeksInMonth } from '@utils/weeksInMonth';

import { IconAdd, IconExport, IconHistory } from '@components/icons';
import { FaTruck, FaWarehouse } from 'react-icons/fa6';
import { Link } from '@tanstack/react-router';

export const PoList = () => {
  const [month, setMonth] = useState<Dayjs>(dayjs());

  const { weeksInMonth, startOfMonth, endOfMonth } = getWeeksInMonth(month);

  const weekTabs: TabsProps['items'] = Array.from(
    { length: weeksInMonth },
    (_, index) => {
      // Calculate the start and end of the week within the current month
      let weekStart = startOfMonth.startOf('isoWeek').add(index, 'week');
      let weekEnd = weekStart.add(6, 'day');

      // Clamp weekStart and weekEnd to the current month
      if (weekStart.isBefore(startOfMonth)) weekStart = startOfMonth;
      if (weekEnd.isAfter(endOfMonth)) weekEnd = endOfMonth;

      return {
        key: `week-${index + 1}`,
        label: `Tuần ${index + 1} (${weekStart.format('DD/MM')} - ${weekEnd.format('DD/MM')})`,
        children: (
          <div className="space-y-2">
            <div className="text-center text-lg font-semibold uppercase">
              Tuần {index + 1}
              <br />
              {`(${weekStart.format('DD/MM/YYYY')} - ${weekEnd.format('DD/MM/YYYY')})`}
            </div>
            <WeekTable
              month={month}
              startDate={weekStart.format('YYYY-MM-DD')}
              endDate={weekEnd.format('YYYY-MM-DD')}
            />
          </div>
        )
      };
    }
  );

  const poTabs: TabsProps['items'] = [
    ...weekTabs,
    {
      key: 'daily',
      label: 'Hàng ngày',
      children: (
        <div className="space-y-2">
          <div className="text-center text-lg font-semibold uppercase">
            Bảng sản lượng sản xuất hàng ngày
            <br />
            Tháng {month.format('MM-YYYY')}
          </div>
          <DailyTable month={month} />
        </div>
      )
    },
    {
      key: 'error',
      label: 'Hàng lỗi',
      children: (
        <div className="space-y-2">
          <div className="text-center text-lg font-semibold uppercase">
            Bảng sản lượng sản xuất hàng lỗi hàng ngày
            <br />
            Tháng {month.format('MM-YYYY')}
          </div>
          <ErrorTable month={month} />
        </div>
      )
    }
  ];

  return (
    <ComponentCard title="Danh sách PO">
      <div className="flex flex-wrap justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/check-po/add">
            <Button variant="solid" color="green" icon={<IconAdd />}>
              Thêm sản lượng
            </Button>
          </Link>
          <Button variant="solid" color="blue" icon={<FaTruck />}>
            Thêm PO xuất hàng
          </Button>
          <Button variant="solid" color="blue" icon={<FaWarehouse />}>
            Thêm tồn đầu kỳ
          </Button>
          <Button variant="solid" color="blue" icon={<IconHistory />}>
            Lịch sử nhập PO
          </Button>
          <Button variant="solid" color="green" icon={<IconExport />}>
            Export
          </Button>
        </div>
        <DatePicker
          picker="month"
          value={month}
          onChange={(date) => (date ? setMonth(date) : setMonth(dayjs()))}
        />
      </div>

      <Tabs items={poTabs} type="card" />
    </ComponentCard>
  );
};
