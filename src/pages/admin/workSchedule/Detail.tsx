import { Route } from '@routes/_authenticated/admin/work-schedules/$id';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@tanstack/react-store';
import {
  Input,
  Select,
  Space,
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

import { ScheduleDetailType } from '@/types/scheduleDetailType';
import { ScheduleType } from '@/types/scheduleType';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { useCrudList } from '@hooks/useCrudList';
import { scheduleDetailService } from '@services/ScheduleDetailService';
import { scheduleService } from '@services/workScheduleService';
import { uiStore } from '@stores/uiStore';
import { countDayOfWeekInMonth } from '@utils/countDayOfWeekInMonth';
import { QueryParams } from '@/types/queryParams';

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

const legends = [
  {
    key: 'N',
    label: 'Ca ngày',
    icon: (
      <Tag className="font-bold" color="blue-inverse">
        N
      </Tag>
    )
  },
  {
    key: 'D',
    label: 'Ca đêm',
    icon: (
      <Tag className="font-bold" color="#000">
        D
      </Tag>
    )
  },
  {
    key: 'X',
    label: 'Nghĩ',
    icon: (
      <Tag className="font-bold" color="red-inverse">
        X
      </Tag>
    )
  },
  {
    key: 'TC',
    label: 'Tăng cường đêm',
    icon: (
      <Tag className="font-bold" color="red-inverse">
        TC
      </Tag>
    )
  },
  {
    key: 'LN',
    label: 'Làm thêm ca ngày',
    icon: (
      <Tag className="font-bold" color="red-inverse">
        LN
      </Tag>
    )
  },
  {
    key: 'VS',
    label: 'Vệ sinh',
    icon: (
      <Tag className="font-bold" color="yellow-inverse">
        <span className="text-black">VS</span>
      </Tag>
    )
  }
];

export default function Detail() {
  const { id } = Route.useParams();
  const { isMobile } = useStore(uiStore);

  const [searchOn, setSearchOn] = useState<'name' | 'code'>('name');
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
      fixed: isMobile ? undefined : 'left'
    },
    {
      title: 'Họ và tên',
      dataIndex: 'employee_name',
      fixed: isMobile ? undefined : 'left'
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
            {legends.find((legend) => legend.key == value)?.icon || value}
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
        return (
          <center>
            {legends.find((legend) => legend.key === 'VS')?.icon || value}
          </center>
        );
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
          return (
            <center>
              {legends.find((legend) => legend.key === 'VS')?.icon || value}
            </center>
          );
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
    eatRoomData.sort((a, b) => {
      for (let i = 1; i <= maxDay; i++) {
        if (a[`day${i}`] && !b[`day${i}`]) {
          return -1;
        }
        if (!a[`day${i}`] && b[`day${i}`]) {
          return 1;
        }
      }
      return 0;
    });
    wcMenData.sort((a, b) => {
      for (let i = 1; i <= maxDay; i++) {
        if (a[`day${i}`] && !b[`day${i}`]) {
          return -1;
        }
        if (!a[`day${i}`] && b[`day${i}`]) {
          return 1;
        }
      }
      return 0;
    });
    wcWomenData.sort((a, b) => {
      for (let i = 1; i <= maxDay; i++) {
        if (a[`day${i}`] && !b[`day${i}`]) {
          return -1;
        }
        if (!a[`day${i}`] && b[`day${i}`]) {
          return 1;
        }
      }
      return 0;
    });
    wcTrashData.sort((a, b) => {
      for (let i = 1; i <= maxDay; i++) {
        if (a[`day${i}`] && !b[`day${i}`]) {
          return -1;
        }
        if (!a[`day${i}`] && b[`day${i}`]) {
          return 1;
        }
      }
      return 0;
    });
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
      label: 'Hàng Nhật - Hàng Chợ',
      children: (
        <>
          {hnhcData?.map((category) => (
            <div key={category.group_id}>
              <div className="flex items-center justify-center bg-cyan-400 py-2">
                <span className="text-md font-bold">{category.group_name}</span>
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
      label: 'Trực phòng ăn',
      children: (
        <>
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
        </>
      )
    },
    {
      key: '3',
      label: 'Đổ rác WC',
      children: (
        <>
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
        </>
      )
    },
    {
      key: '4',
      label: 'Trực WC nữ',
      children: (
        <>
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
        </>
      )
    },
    {
      key: '5',
      label: 'Trực WC nam',
      children: (
        <>
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
        </>
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
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {legends.map((legend) => (
              <div key={legend.key}>
                {legend.icon}
                <span>{legend.label}</span>
              </div>
            ))}
          </div>
          <Space.Compact
            className="col-span-1 sm:col-span-2"
            style={{ width: '100%' }}
          >
            <Select
              defaultValue={searchOn}
              options={[
                { label: 'Tên', value: 'name' },
                { label: 'Mã', value: 'code' }
              ]}
              onChange={(value) => {
                setSearchOn(value);
              }}
            />
            <Input.Search
              placeholder="Tìm kiếm nhân viên"
              allowClear
              onSearch={(value) => {
                setParams((prev) => ({
                  ...prev,
                  'filter[employee_id]': undefined,
                  'filter[employees.name]': undefined
                }));
                if (searchOn === 'code') {
                  setParams((prev) => ({
                    ...prev,
                    'filter[employee_id]': value ? value : undefined
                  }));
                } else {
                  setParams((prev) => ({
                    ...prev,
                    'filter[employees.name]': value ? value : undefined
                  }));
                }
              }}
            />
          </Space.Compact>
        </div>
        <Spin size="large" tip="Đang tải..." spinning={queryResult.isLoading}>
          {queryResult.isError ? (
            <div className="flex items-center justify-center">
              <span className="text-red-500">Không tìm thấy lịch làm việc</span>
            </div>
          ) : (
            <Tabs items={items} size="middle" type="card" animated />
          )}
        </Spin>
      </ComponentCard>
    </>
  );
}
