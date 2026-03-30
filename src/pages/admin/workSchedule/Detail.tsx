import { Route } from '@routes/_authenticated/work-schedules/$id';
import { useQuery } from '@tanstack/react-query';
import {
  Input,
  Spin,
  Table,
  TableColumnsType,
  TableProps,
  Tabs,
  TabsProps,
  Tag
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import {
  FaCalendarCheck,
  FaUtensils,
  FaTrashAlt,
  FaFemale,
  FaMale,
  FaSearch
} from 'react-icons/fa';

import { workLegends } from '@/configs/legend/workLegends.config';
import { QueryParams } from '@/types/queryParams';
import { ScheduleDetailType } from '@/types/scheduleDetailType';
import { ScheduleType } from '@/types/scheduleType';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { useCrudList } from '@hooks/useCrudList';
import { scheduleDetailService } from '@services/ScheduleDetailService';
import { scheduleService } from '@services/workScheduleService';
import { countDayOfWeekInMonth } from '@utils/countDayOfWeekInMonth';

interface HnhcTableType {
  key: string;
  employee_id: string;
  employee_name: string;
  schedule_category_id: number | string;
  [dayKey: `day${number}`]: ScheduleDetailType['hnhc'];
}

interface WcTableType {
  key: string;
  employee_id: string;
  employee_name: string;
  category_schedule_id: number | string;
  [dayKey: `day${number}`]: boolean;
}

interface HNHCGroupedData {
  group_id: string | number;
  group_name: string;
  data: HnhcTableType[];
}

export default function Detail() {
  const { id } = Route.useParams();
  const [params, setParams] = useState<QueryParams>();
  const [maxDay, setMaxDay] = useState<number>(0);
  const [totalSaturdays, setTotalSaturdays] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<dayjs.Dayjs | null>(null);

  const { data: schedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ['schedule', id],
    queryFn: async () => {
      const response = await scheduleService.get(id);
      return response as ScheduleType;
    }
  });

  const { data: scheduleDetails, queryResult } = useCrudList({
    service: scheduleDetailService,
    queryKey: 'scheduleDetails',
    initialFilters: {
      limit: 0,
      include: ['employees', 'schedules', 'employees.calendarCategory'],
      sort: 'date',
      'filter[schedule_id]': id,
      'fields[employees]': 'id,name,calendar_category_id',
      ...params
    }
  });

  const employees = scheduleDetails.reduce(
    (acc: { [key: string]: typeof scheduleDetails }, item) => {
      const employee_id = item.employee_id;
      if (!acc[employee_id]) {
        acc[employee_id] = [];
      }
      acc[employee_id].push(item);
      return acc;
    },
    {}
  );

  const handleSearch = (value: string, type: 'name' | 'code') => {
    setParams((prev) => ({
      ...prev,
      'filter[employees.id]': undefined,
      'filter[employee.name]': undefined
    }));
    if (!value) {
      return;
    }
    if (type === 'name') {
      setParams((prev) => ({
        ...prev,
        'filter[employee.name]': value ? value : undefined
      }));
    } else if (type === 'code') {
      setParams((prev) => ({
        ...prev,
        'filter[employees.id]': value ? value : undefined
      }));
    }
  };

  useEffect(() => {
    const currentDate = dayjs(schedule?.date).startOf('month');
    setCurrentDate(currentDate);
  }, [schedule]);

  useEffect(() => {
    setMaxDay(dayjs(currentDate).daysInMonth());
    setTotalSaturdays(countDayOfWeekInMonth(currentDate, 6));
  }, [currentDate]);

  const hnhcData = useMemo(() => {
    if (!employees || Object.keys(employees).length === 0) {
      return [];
    }
    const grouped: { [group_id: string]: HNHCGroupedData } = {};

    Object.entries(employees).forEach(([employee_id, records]) => {
      const group_id = records[0]?.employees?.calendar_category_id || '';
      const group_name = records[0]?.employees?.calendar_category?.name || '';

      const row: HnhcTableType = {
        key: employee_id,
        employee_id: employee_id,
        employee_name: records[0]?.employees?.name || '',
        schedule_category_id: group_id
      };

      records.forEach((item) => {
        if (!item.hnhc) {
          return;
        }
        const day = dayjs(item.date).get('date');
        row[`day${day}`] = item.hnhc;
      });

      if (Object.keys(row).length <= 4) {
        return;
      }

      if (!grouped[group_id]) {
        grouped[group_id] = {
          group_id,
          group_name,
          data: []
        };
      }

      grouped[group_id].data.push(row);
    });

    const data = Object.values(grouped);
    return data;
  }, [employees]);

  const columnsDefault = [
    {
      title: 'Mã NV',
      dataIndex: 'employee_id',
      render: (value: string) => (
        <Tag color="blue" className="!font-mono !text-xs">
          {value}
        </Tag>
      )
    },
    {
      title: 'Họ và tên',
      dataIndex: 'employee_name',
      fixed: 'left',
      render: (value: string) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {value || (
            <span className="text-gray-400 italic">Chưa có thông tin</span>
          )}
        </span>
      )
    }
  ];
  const columnsHNHC: TableColumnsType<HnhcTableType> = [
    ...(columnsDefault as TableColumnsType<HnhcTableType>),
    ...Array.from({ length: maxDay }).map((_, index) => ({
      title: () => {
        const day = dayjs(currentDate).startOf('month').add(index, 'day');

        return (
          <div className="flex flex-col items-center">
            <span className="text-center">
              {day.get('date').toString().padStart(2, '0')}
            </span>
            <span className="text-center">{day.format('ddd')}</span>
          </div>
        );
      },
      dataIndex: 'day' + (index + 1),
      key: 'day' + (index + 1),
      render: (value: string) => {
        if (!value) return null;
        return (
          <center>
            {workLegends[value as keyof typeof workLegends]?.icon || value}
          </center>
        );
      }
    }))
  ];
  const columnsWC: TableProps<WcTableType>['columns'] = [
    ...(columnsDefault as TableColumnsType<WcTableType>),
    ...Array.from({ length: maxDay }).map((_, index) => ({
      title: () => {
        const day = dayjs(currentDate).startOf('month').add(index, 'day');

        return (
          <div className="flex flex-col items-center">
            <span className="text-center">
              {day.get('date').toString().padStart(2, '0')}
            </span>
            <span className="text-center">{day.format('ddd')}</span>
          </div>
        );
      },
      dataIndex: 'day' + (index + 1),
      render: (value: boolean) => {
        if (!value) return null;
        return <center>{value && workLegends['VS'].icon}</center>;
      }
    }))
  ];
  const columnsTrashWC: TableProps<WcTableType>['columns'] = [
    ...(columnsDefault as TableColumnsType<WcTableType>),
    ...Array.from({ length: totalSaturdays }).map((_, index) => {
      const day = dayjs(currentDate).startOf('month').add(index, 'week').day(6);
      return {
        title: () => (
          <div className="flex flex-col items-center">
            <span className="text-center">
              {day.get('date').toString().padStart(2, '0')}
            </span>
            <span className="text-center">{day.format('ddd')}</span>
          </div>
        ),
        dataIndex: 'day' + day.date(),
        render: (value: boolean) => {
          if (!value) return null;
          return <center>{value && (workLegends['VS'].icon || value)}</center>;
        }
      };
    })
  ];

  const { eatRoomData, wcMenData, wcWomenData, wcTrashData } = useMemo(() => {
    if (Object.keys(employees).length === 0) {
      return {
        eatRoomData: [],
        wcMenData: [],
        wcWomenData: [],
        wcTrashData: []
      };
    }

    const eatRoomData: WcTableType[] = [];
    const wcMenData: WcTableType[] = [];
    const wcWomenData: WcTableType[] = [];
    const wcTrashData: WcTableType[] = [];
    Object.entries(employees).forEach(([employee_id, records]) => {
      const eatRoomRow: WcTableType = {
        key: employee_id,
        employee_id: employee_id,
        employee_name: records[0]?.employees?.name || '',
        category_schedule_id: records[0]?.employees?.calendar_category_id || ''
      };
      const wcMenRow: WcTableType = {
        key: employee_id,
        employee_id: employee_id,
        employee_name: records[0]?.employees?.name || '',
        category_schedule_id: records[0]?.employees?.calendar_category_id || ''
      };
      const wcWomenRow: WcTableType = {
        key: employee_id,
        employee_id: employee_id,
        employee_name: records[0]?.employees?.name || '',
        category_schedule_id: records[0]?.employees?.calendar_category_id || ''
      };
      const wcTrashRow: WcTableType = {
        key: employee_id,
        employee_id: employee_id,
        employee_name: records[0]?.employees?.name || '',
        category_schedule_id: records[0]?.employees?.calendar_category_id || ''
      };

      records.forEach((item) => {
        const day = dayjs(item.date).get('date');
        if (item.is_eat_room) {
          eatRoomRow[`day${day}`] = item.is_eat_room;
        }
        if (item.is_wc_clean_men) {
          wcMenRow[`day${day}`] = item.is_wc_clean_men;
        }
        if (item.is_wc_clean_women) {
          wcWomenRow[`day${day}`] = item.is_wc_clean_women;
        }
        if (item.is_wc_trash) {
          wcTrashRow[`day${day}`] = item.is_wc_trash;
        }
      });

      if (Object.keys(eatRoomRow).length > 4) {
        eatRoomData.push(eatRoomRow);
      }
      if (Object.keys(wcMenRow).length > 4) {
        wcMenData.push(wcMenRow);
      }
      if (Object.keys(wcWomenRow).length > 4) {
        wcWomenData.push(wcWomenRow);
      }
      if (Object.keys(wcTrashRow).length > 4) {
        wcTrashData.push(wcTrashRow);
      }
    });
    const sortFn = (a: WcTableType, b: WcTableType) => {
      for (let i = 1; i <= maxDay; i++) {
        if (a[`day${i}`] && !b[`day${i}`]) return -1;
        if (!a[`day${i}`] && b[`day${i}`]) return 1;
      }
      return 0;
    };
    eatRoomData.sort(sortFn);
    wcMenData.sort(sortFn);
    wcWomenData.sort(sortFn);
    wcTrashData.sort(sortFn);
    return {
      eatRoomData,
      wcMenData,
      wcWomenData,
      wcTrashData
    };
  }, [employees, maxDay]);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaCalendarCheck className="text-blue-500" />
          Hàng Nhật - Hàng Chợ
        </span>
      ),
      children: (
        <>
          {hnhcData?.map((category) => (
            <div key={category.group_id} className="mb-4">
              <div className="flex items-center justify-center rounded-t-lg bg-gradient-to-r from-cyan-400 to-cyan-500 py-2">
                <span className="text-md font-bold text-white">
                  {category.group_name}
                </span>
              </div>

              <Table<HnhcTableType>
                columns={columnsHNHC}
                dataSource={category.data}
                rowKey={(record) =>
                  [
                    'scheduleHNHC',
                    record.schedule_category_id,
                    record.employee_id
                  ].join('-')
                }
                bordered
                scroll={{ x: 'max-content' }}
                pagination={false}
                size="small"
              />
            </div>
          ))}
        </>
      )
    },
    {
      key: '2',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaUtensils className="text-amber-500" />
          Trực phòng ăn
        </span>
      ),
      children: (
        <Table<WcTableType>
          columns={columnsWC}
          dataSource={eatRoomData}
          rowKey={(record) =>
            [
              'scheduleEatRoom',
              record.category_schedule_id,
              record.employee_id
            ].join('-')
          }
          bordered
          scroll={{ x: 'max-content' }}
          pagination={false}
          size="small"
        />
      )
    },
    {
      key: '3',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaTrashAlt className="text-emerald-500" />
          Đổ rác WC
        </span>
      ),
      children: (
        <Table<WcTableType>
          columns={columnsTrashWC}
          dataSource={wcTrashData}
          rowKey={(record) =>
            [
              'scheduleEatRoom',
              record.category_schedule_id,
              record.employee_id
            ].join('-')
          }
          bordered
          scroll={{ x: 'max-content' }}
          pagination={false}
          size="small"
        />
      )
    },
    {
      key: '4',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaFemale className="text-pink-500" />
          Trực WC nữ
        </span>
      ),
      children: (
        <Table<WcTableType>
          columns={columnsWC}
          dataSource={wcWomenData}
          rowKey={(record) =>
            [
              'scheduleWCWomen',
              record.category_schedule_id,
              record.employee_id
            ].join('-')
          }
          bordered
          scroll={{ x: 'max-content' }}
          pagination={false}
          size="small"
        />
      )
    },
    {
      key: '5',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaMale className="text-blue-500" />
          Trực WC nam
        </span>
      ),
      children: (
        <Table<WcTableType>
          columns={columnsWC}
          dataSource={wcMenData}
          rowKey={(record) =>
            [
              'scheduleWCMen',
              record.category_schedule_id,
              record.employee_id
            ].join('-')
          }
          bordered
          scroll={{ x: 'max-content' }}
          pagination={false}
          size="small"
        />
      )
    }
  ];

  return (
    <>
      <BackButton />
      <ComponentCard
        title={
          isLoadingSchedule
            ? 'Chi tiết lịch làm việc'
            : `Chi tiết lịch làm việc tháng ${currentDate?.format('MM-YYYY')}`
        }
      >
        <div className="space-y-5">
          {/* ── Legends ──────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">
            {Object.entries(workLegends).map(([key, legend]) => (
              <div
                key={key}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800"
              >
                {legend.icon}
                <span className="text-gray-600 dark:text-gray-400">
                  {legend.label}
                </span>
              </div>
            ))}
          </div>

          {/* ── Filter Bar ──────────────────────────────────────── */}
          <div className="rounded-xl border border-gray-100 bg-white/80 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  <FaSearch className="mr-1 inline-block text-gray-400" />
                  Tìm kiếm nhân viên
                </label>
                <Input.Search
                  placeholder="Mã hoặc tên nhân viên..."
                  allowClear
                  className="!rounded-lg"
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (/^\d+$/.test(inputValue)) {
                      handleSearch(inputValue, 'code');
                    } else {
                      handleSearch(inputValue, 'name');
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Tabs ────────────────────────────────────────────── */}
          <Spin tip="Đang tải..." spinning={queryResult.isLoading}>
            {queryResult.isError ? (
              <div className="flex items-center justify-center rounded-xl border border-red-100 bg-red-50 p-8 dark:border-red-900/50 dark:bg-red-900/20">
                <span className="text-red-500">
                  Không tìm thấy lịch làm việc
                </span>
              </div>
            ) : (
              <Tabs items={items} size="large" type="card" animated />
            )}
          </Spin>
        </div>
      </ComponentCard>
    </>
  );
}
