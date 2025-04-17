import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Input, Spin, Table, TableProps, Tabs, TabsProps, Tag } from 'antd';

import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { fetchWorkScheduleById } from '@services/workScheduleService';
import { uiStore } from '@stores/uiStore';
import { useStore } from '@tanstack/react-store';

import {
  EmployeeSchedule,
  EmployeeTrashWCSchedule
} from '@/types/workScheduleType';

export const Route = createFileRoute(
  '/_authenticated/admin/work-schedules/$id'
)({
  component: RouteComponent
});

const getDaysOfMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // Months are zero-based in JavaScript
  const end = new Date(year, month + 1, 0).getDate(); // End of the month
  return { year, month, end: end || 31 };
};

function RouteComponent() {
  const { id } = Route.useParams();
  const { isMobile } = useStore(uiStore);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['workSchedule', id],
    queryFn: () => fetchWorkScheduleById(id)
  });

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

  const {
    year,
    month,
    end: days
  } = getDaysOfMonth(new Date(data?.schedule?.start_date || ''));

  const columnsHNHC: TableProps<EmployeeSchedule>['columns'] = [
    {
      title: 'Mã NV',
      dataIndex: 'employee_id',
      fixed: isMobile ? undefined : 'left'
    },
    {
      title: 'Họ và tên',
      dataIndex: 'employee_name',
      fixed: isMobile ? undefined : 'left'
    },
    ...Array.from({ length: days }).map((_, index) => ({
      title: () => (
        <div className="flex flex-col items-center">
          <span className="text-center">
            {new Date(year, month, index + 1).toLocaleDateString('vi-VN', {
              day: '2-digit'
            })}
          </span>
          <span className="text-center">
            {new Date(year, month, index + 1).toLocaleDateString('vi-VN', {
              weekday: 'narrow'
            })}
          </span>
        </div>
      ),
      dataIndex: 'day' + (index + 1),
      render: (value: string) => {
        return (
          <center>
            {legends.find((legend) => legend.key == value)?.icon || value}
          </center>
        );
      }
    }))
  ];

  const columnsWC: TableProps<EmployeeSchedule>['columns'] = [
    {
      title: 'Mã NV',
      dataIndex: 'employee_id',
      fixed: isMobile ? undefined : 'left'
    },
    {
      title: 'Họ và tên',
      dataIndex: 'employee_name',
      fixed: isMobile ? undefined : 'left'
    },
    ...Array.from({ length: days }).map((_, index) => ({
      title: () => (
        <div className="flex flex-col items-center">
          <span className="text-center">
            {new Date(year, month, index + 1).toLocaleDateString('vi-VN', {
              day: '2-digit'
            })}
          </span>
          <span className="text-center">
            {new Date(year, month, index + 1).toLocaleDateString('vi-VN', {
              weekday: 'narrow'
            })}
          </span>
        </div>
      ),
      dataIndex: 'day' + (index + 1),
      render: (value: string) => {
        return (
          <center>
            {value != null
              ? legends.find((legend) => legend.key === 'VS')?.icon
              : value}
          </center>
        );
      }
    }))
  ];

  const saturdaysList = Array.from({ length: days })
    .map((_, index) => {
      const date = new Date(year, month, index + 1);
      return date.getDay() === 6 ? index + 1 : null;
    })
    .filter((day) => day !== null);

  const columnsTrashWC: TableProps<EmployeeTrashWCSchedule>['columns'] = [
    {
      title: 'Mã NV',
      dataIndex: 'employee_id',
      fixed: isMobile ? undefined : 'left'
    },
    {
      title: 'Họ và tên',
      dataIndex: 'employee_name',
      fixed: isMobile ? undefined : 'left'
    },
    ...saturdaysList.map((item, index) => {
      const date = new Date(year, month, item);
      return {
        title: () => (
          <div className="flex flex-col items-center">
            <span className="text-center">
              {date.toLocaleDateString('vi-VN', { day: '2-digit' })}
            </span>
            <span className="text-center">
              {date.toLocaleDateString('vi-VN', { weekday: 'narrow' })}
            </span>
          </div>
        ),
        dataIndex: 'day' + (index + 1),
        render: (value: string) => {
          return (
            <center>
              {value != null
                ? legends.find((legend) => legend.key === 'VS')?.icon
                : value}
            </center>
          );
        }
      };
    })
  ];

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Hàng Nhật - Hàng Chợ',
      children: (
        <>
          {data?.categories.map((category) => (
            <div key={category.id}>
              <div className="flex items-center justify-center bg-cyan-400 py-2">
                <span className="text-md font-bold">{category.name}</span>
              </div>

              <Table<EmployeeSchedule>
                columns={columnsHNHC}
                dataSource={data?.schedule_hnhc.filter(
                  (item) => item.category_schedule_id == category.id
                )}
                rowKey={(record) =>
                  [
                    'scheduleHNHC',
                    record.category_schedule_id,
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
          <Table<EmployeeSchedule>
            columns={columnsWC}
            dataSource={data?.schedule_eat_room}
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
          <Table<EmployeeTrashWCSchedule>
            columns={columnsTrashWC}
            dataSource={data?.schedule_wc}
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
          <Table<EmployeeSchedule>
            columns={columnsWC}
            dataSource={data?.schedule_wc_women}
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
          <Table<EmployeeSchedule>
            columns={columnsWC}
            dataSource={data?.schedule_wc_men}
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
      <ComponentCard title={data?.schedule.title || 'Chi tiết lịch làm việc'}>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {legends.map((legend) => (
              <div key={legend.key}>
                {legend.icon}
                <span>{legend.label}</span>
              </div>
            ))}
          </div>
          <Input placeholder="Tìm kiếm nhân viên..." />
        </div>
        <Spin size="large" tip="Đang tải..." spinning={isLoading}>
          {isError ? (
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
