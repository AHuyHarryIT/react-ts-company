import { useDailyScheduleUpdateFields } from '@/configs/dailyScheduleForm.config';
import { DailyScheduleType } from '@/types/dailyScheduleType';
import { QueryParams } from '@/types/queryParams';
import ComponentCard from '@components/common/ComponentCard';
import { customTableProps } from '@components/custom/TableProps.custom';
import { IconHistory } from '@components/icons';
import { ConfirmButton } from '@components/ui/CRUD/ConfirmButton';
import { UpdateModal } from '@components/ui/CRUD/UpdateModal';
import { useCrudList } from '@hooks/useCrudList';
import { dailyScheduleSchema } from '@schemas/dailyScheduleSchema.schema';
import { dailyScheduleService } from '@services/DailyScheduleService';
import {
  Button,
  DatePicker,
  Table,
  TableColumnsType,
  TableProps,
  Tag
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

export default function DailySchedule() {
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 10,
    'filter[date]': dayjs().format('YYYY-MM-DD')
  });

  const dailyScheduleUpdateFields = useDailyScheduleUpdateFields();

  const {
    data: dataSource,
    pagination,
    queryResult
  } = useCrudList({
    queryKey: 'daily-schedule',
    service: dailyScheduleService,
    initialFilters: params
  });

  const columns: TableColumnsType<DailyScheduleType> = [
    {
      title: 'STT',
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      render: (_value, _record, index) =>
        index + 1 + (params.limit ?? 10) * ((params.page ?? 1) - 1)
    },
    {
      title: 'Mã lịch làm việc',
      key: 'id',
      dataIndex: 'id',
      minWidth: 50
    },
    {
      title: 'Mã nhân viên',
      key: 'employee_id',
      dataIndex: 'employee_id',
      minWidth: 120
    },
    {
      title: 'Tên nhân viên',
      key: 'name',
      dataIndex: ['employee', 'name'],
      minWidth: 200,
      render: (value) => {
        return value || 'Chưa có thông tin';
      }
    },
    {
      title: 'Tên sản phẩm',
      key: 'product_name',
      dataIndex: ['product', 'name'],
      minWidth: 200
    },
    {
      title: 'Ca làm việc',
      dataIndex: 'shift',
      minWidth: 100
    },
    {
      title: 'Ngày nhập',
      key: 'date',
      dataIndex: 'date',
      minWidth: 100,
      render: (value) => {
        return dayjs(value).format('DD-MM-YYYY');
      }
    },
    {
      title: 'Thời gian bắt đầu',
      key: 'start_time',
      dataIndex: 'created_at',
      align: 'center',
      minWidth: 150,
      render: (value) => {
        return (
          <Tag color="green-inverse" className="font-bold uppercase">
            {dayjs(value).format('HH:mm:ss')}
          </Tag>
        );
      }
    },
    {
      title: 'Thời gian kết thúc',
      key: 'end_time',
      align: 'center',
      minWidth: 100,
      render: (_value, record) => {
        if (record.dailyQuantities?.length == 0) {
          return (
            <Tag color="red-inverse" className="font-bold uppercase">
              Chưa nhập sản lượng
            </Tag>
          );
        }
        return (
          <>
            {record.dailyQuantities?.map((item) => (
              <Tag color="green-inverse" className="font-bold uppercase">
                {dayjs(item.created_at_formatted, 'HH:mm:ss').format(
                  'HH:mm:ss'
                )}
              </Tag>
            ))}
          </>
        );
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      minWidth: 100,
      render: (_, record) => {
        return (
          <div className="flex items-center justify-center gap-2">
            <UpdateModal
              id={record.id}
              service={dailyScheduleService}
              schema={dailyScheduleSchema}
              fields={dailyScheduleUpdateFields}
            />
            <ConfirmButton
              id={record.id}
              service={dailyScheduleService}
              content={
                <span>
                  Bạn có chắc chắn muốn xóa bản ghi <strong>{record.id}</strong>{' '}
                  không?
                </span>
              }
            />
          </div>
        );
      }
    }
  ];
  const tableProps: TableProps<DailyScheduleType> = {
    ...(customTableProps as unknown as TableProps<DailyScheduleType>),
    rowKey: (record) =>
      ['attendances', 'sheet', record.employee_id, record.date].join('-'),
    columns: columns,
    dataSource: dataSource,
    loading: queryResult.isLoading,
    pagination: {
      ...customTableProps.pagination,
      current: params.page,
      pageSize: params.limit,
      total: pagination.total,
      onShowSizeChange: (_current, size) => {
        setParams((prev) => ({
          ...prev,
          limit: size
        }));
      },
      onChange: (page) => {
        setParams((prev) => ({
          ...prev,
          page: page
        }));
      }
    }
  };

  return (
    <ComponentCard title="Danh sách lịch làm việc trong ngày">
      <div className="flex flex-wrap gap-4">
        {/* TODO: Add navigation to daily schedule */}
        <Button variant="solid" color="primary" icon={<IconHistory />}>
          Kiểm tra nhân viên nhập sản lượng
        </Button>
        <DatePicker
          value={dayjs(params['filter[date]'])}
          onChange={(date) =>
            setParams((prev) => ({
              ...prev,
              'filter[date]': date
                ? dayjs(date).format('YYYY-MM-DD')
                : undefined
            }))
          }
        />
      </div>
      <Table {...tableProps} />
    </ComponentCard>
  );
}
