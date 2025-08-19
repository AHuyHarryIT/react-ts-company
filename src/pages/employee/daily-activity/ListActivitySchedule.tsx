import { useDailyScheduleUpdateFields } from '@/configs/dailyScheduleForm.config';
import { DailyQuantitiesType } from '@/types/dailyQuantitiesType';
import { DailyScheduleType } from '@/types/dailyScheduleType';
import { QueryParams } from '@/types/queryParams';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { customTableProps } from '@components/custom/TableProps.custom';
import { ConfirmButton } from '@components/ui/CRUD/ConfirmButton';
import { UpdateModal } from '@components/ui/CRUD/UpdateModal';
import { productStatusOptions } from '@constants/productStatus.enum';
import { dailyScheduleSchema } from '@schemas/dailyScheduleSchema.schema';
import {
  empDailyScheduleService,
  fetchEmpDailyActivities
} from '@services/DailyScheduleService';
import { uiStore } from '@stores/uiStore';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@tanstack/react-store';
import {
  DatePicker,
  Empty,
  Spin,
  Table,
  TableColumnsType,
  TableProps,
  Tag
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { ActivityCard } from './ActivityCard';

export const ListActivity = () => {
  const { isMobile } = useStore(uiStore);
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 10,
    'filter[date]': dayjs().format('YYYY-MM-DD')
  });

  const dailyScheduleUpdateFields = useDailyScheduleUpdateFields();

  const { data: response, isLoading } = useQuery({
    queryKey: ['employee', 'daily-activities', params],
    queryFn: () => fetchEmpDailyActivities(params)
  });

  const columns: TableColumnsType<DailyScheduleType> = [
    {
      title: 'STT',
      rowScope: 'row',
      align: 'center',
      render: (_value, _record, index) =>
        index + 1 + (params.limit ?? 10) * ((params.page ?? 1) - 1)
    },
    {
      title: 'Tên sản phẩm',
      key: 'product_name',
      dataIndex: ['product', 'name']
    },
    {
      title: 'Ca làm việc',
      key: 'shift',
      dataIndex: ['shift']
    },

    {
      title: 'Trạng thái',
      key: 'status',
      align: 'center',
      render: (_value, record) => {
        if (record.dailyQuantities) {
          return (
            <Tag color="green-inverse" className="font-bold uppercase">
              Đã nhập
            </Tag>
          );
        } else {
          return (
            <Tag color="red-inverse" className="font-bold uppercase">
              Chưa nhập
            </Tag>
          );
        }
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_value, record) => (
        <div className="space-x-2">
          <UpdateModal
            id={record.id}
            service={empDailyScheduleService}
            schema={dailyScheduleSchema}
            fields={dailyScheduleUpdateFields}
          />
          <ConfirmButton
            id={record.id}
            service={empDailyScheduleService}
            content={
              <span>
                Bạn có chắc chắn muốn xóa bản ghi <strong>{record.id}</strong>{' '}
                không?
              </span>
            }
          />
        </div>
      )
    }
  ];

  const expandColumns: TableColumnsType<DailyQuantitiesType> = [
    {
      title: 'Loại sản phẩm',
      key: 'working',
      dataIndex: ['status'],
      render: (value) =>
        productStatusOptions.find((item) => item.value === value)?.label ||
        'Chưa xác định'
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      dataIndex: ['quantity'],
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('en-US', {
          maximumFractionDigits: 0
        });
      }
    },
    {
      title: 'Thời gian kết thúc',
      key: 'end_time',
      align: 'center',
      dataIndex: ['created_at_formatted'],
      render: (value) => {
        return (
          <Tag color="green-inverse" className="font-bold uppercase">
            {dayjs(value, 'HH:mm:ss').format('HH:mm:ss')}
          </Tag>
        );
      }
    }
  ];

  const tableProps: TableProps<DailyScheduleType> = {
    // TODO: Fix type casting issue
    ...(customTableProps as unknown as TableProps<DailyScheduleType>),
    rowKey: (record) => ['activity', record.id].join('-'),
    columns: columns,
    expandable: {
      expandedRowRender: (record) => (
        <Table<DailyQuantitiesType>
          rowKey={(record) => ['expanded', 'activity', record.id].join('-')}
          columns={expandColumns}
          dataSource={record.dailyQuantities || []}
          pagination={false}
        />
      ),
      defaultExpandAllRows: true
    },
    dataSource: response?.data || [],
    loading: isLoading,
    pagination: {
      ...customTableProps.pagination,
      current: response?.current_page || 1,
      pageSize: response?.per_page || 10,
      total: response?.total || 0,
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
    <>
      <BackButton to="/" />
      <ComponentCard title="Lịch sử bản ghi của nhân viên">
        <div>
          <label htmlFor="month-picker">Chọn tháng</label>
          <br />
          <DatePicker
            id="month-picker"
            placeholder="Chọn ngày"
            value={dayjs(params['filter[date]'])}
            onChange={(date) => {
              setParams((prev) => ({
                ...prev,
                'filter[date]': date ? date.format('YYYY-MM-DD') : undefined
              }));
            }}
          />
        </div>
        {isMobile ? (
          <Spin spinning={isLoading}>
            <div className="flex flex-col gap-4">
              {response?.data && response.data.length > 0 ? (
                response.data.map((item) => (
                  <ActivityCard
                    key={`activity_card-${item.id}`}
                    id={item.id}
                    productName={item.product?.name || 'Chưa xác định'}
                    shift={item.shift}
                    startDate={dayjs(item.date).format('DD-MM-YYYY')}
                    isStatus={(item.dailyQuantities?.length ?? 0) > 0}
                    quantities={item.dailyQuantities?.map((quantity) => ({
                      type: quantity.status,
                      quantity: quantity.quantity,
                      time: quantity.created_at_formatted
                    }))}
                  />
                ))
              ) : (
                <Empty />
              )}
            </div>
          </Spin>
        ) : (
          <Table<DailyScheduleType> {...tableProps} />
        )}
      </ComponentCard>
    </>
  );
};
