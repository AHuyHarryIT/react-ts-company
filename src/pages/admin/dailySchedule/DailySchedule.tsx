import { useDailyScheduleUpdateFields } from '@/configs/dailyScheduleForm.config';
import { DailyQuantitiesType } from '@/types/dailyQuantitiesType';
import { DailyScheduleType } from '@/types/dailyScheduleType';
import { QueryParams } from '@/types/queryParams';
import ComponentCard from '@components/common/ComponentCard';
import { customTableProps } from '@components/custom/TableProps.custom';
import { ConfirmButton } from '@components/ui/CRUD/ConfirmButton';
import { UpdateModal } from '@components/ui/CRUD/UpdateModal';
import { productStatusOptions } from '@constants/productStatus.enum';
import { dailyScheduleSchema } from '@schemas/dailyScheduleSchema.schema';
import { dailyScheduleService } from '@services/DailyScheduleService';
import { uiStore } from '@stores/uiStore';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@tanstack/react-store';
import {
  Button,
  DatePicker,
  Empty,
  Pagination,
  Spin,
  Table,
  TableColumnsType,
  TableProps,
  Tag
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

export default function DailySchedule() {
  const { isMobile } = useStore(uiStore);
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 50,
    'filter[date]': dayjs().format('YYYY-MM-DD')
  });
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const dailyScheduleUpdateFields = useDailyScheduleUpdateFields();

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin', 'daily-schedule', params],
    queryFn: () => dailyScheduleService.list(params)
  });

  // Functions to handle expand/collapse all
  const isAllExpanded =
    expandedRowKeys.length === (response?.data?.length || 0) &&
    (response?.data?.length || 0) > 0;

  const handleToggleAll = () => {
    if (isAllExpanded) {
      setExpandedRowKeys([]);
    } else {
      if (response?.data) {
        const allKeys = response.data.map((record) =>
          ['admin', 'daily-schedule', record.id].join('-')
        );
        setExpandedRowKeys(allKeys);
      }
    }
  };

  const columns: TableColumnsType<DailyScheduleType> = [
    {
      title: 'STT',
      rowScope: 'row',
      align: 'center',
      render: (_value, _record, index) =>
        index + 1 + (params.limit ?? 50) * ((params.page ?? 1) - 1)
    },
    {
      title: 'Mã lịch làm việc',
      key: 'id',
      dataIndex: 'id',
      align: 'center'
    },
    {
      title: 'Mã nhân viên',
      key: 'employee_id',
      dataIndex: 'employee_id',
      align: 'center'
    },
    {
      title: 'Tên nhân viên',
      key: 'name',
      dataIndex: ['employee', 'name'],
      render: (value) => value || 'Chưa có thông tin'
    },
    {
      title: 'Tên sản phẩm',
      key: 'product_name',
      dataIndex: ['product', 'name']
    },
    {
      title: 'Ca làm việc',
      dataIndex: 'shift',
      align: 'center'
    },
    {
      title: 'Ngày nhập',
      key: 'date',
      dataIndex: 'date',
      align: 'center',
      render: (value) => dayjs(value).format('DD-MM-YYYY')
    },
    {
      title: 'Trạng thái',
      key: 'status',
      align: 'center',
      render: (_value, record) => {
        if (record.dailyQuantities && record.dailyQuantities.length > 0) {
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
    ...(customTableProps as unknown as TableProps<DailyScheduleType>),
    rowKey: (record) => ['admin', 'daily-schedule', record.id].join('-'),
    columns: columns,
    expandable: {
      expandedRowRender: (record, index) => (
        <div
          className={`rounded-lg p-4 ${
            index % 4 === 0
              ? 'bg-blue-50'
              : index % 4 === 1
                ? 'bg-green-50'
                : index % 4 === 2
                  ? 'bg-yellow-50'
                  : 'bg-purple-50'
          }`}
        >
          <div className="mb-2 text-sm font-medium text-gray-700">
            Chi tiết sản lượng của {record.employee?.name || 'nhân viên'}
          </div>
          <Table<DailyQuantitiesType>
            rowKey={(record) =>
              ['expanded', 'admin', 'daily-schedule', record.id].join('-')
            }
            columns={expandColumns}
            dataSource={record.dailyQuantities || []}
            pagination={false}
            size="small"
            className="shadow-sm"
          />
        </div>
      ),
      expandedRowKeys: expandedRowKeys,
      onExpand: (expanded, record) => {
        const key = ['admin', 'daily-schedule', record.id].join('-');
        if (expanded) {
          setExpandedRowKeys((prev) => [...prev, key]);
        } else {
          setExpandedRowKeys((prev) => prev.filter((k) => k !== key));
        }
      }
    },
    dataSource: response?.data || [],
    loading: isLoading,
    pagination: {
      ...customTableProps.pagination,
      current: response?.current_page || 1,
      pageSize: response?.per_page || 50,
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

  const pagination = {
    ...tableProps.pagination
  };

  return (
    <ComponentCard title="Danh sách nhân viên đang làm việc">
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div>
          <label
            htmlFor="admin-date-picker"
            className="mb-1 block text-sm font-medium"
          >
            Chọn ngày
          </label>
          <DatePicker
            id="admin-date-picker"
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
        {!isMobile && (
          <Button
            type={isAllExpanded ? 'default' : 'primary'}
            onClick={handleToggleAll}
            className="min-w-[120px]"
          >
            {isAllExpanded ? 'Đóng tất cả' : 'Mở tất cả'}
          </Button>
        )}
      </div>
      {isMobile ? (
        <Spin spinning={isLoading}>
          <Pagination {...pagination} />
          <div className="my-6 flex flex-col gap-4">
            {response?.data && response.data.length > 0 ? (
              response.data.map((item) => (
                <div
                  key={`admin_activity_card-${item.id}`}
                  className="rounded border p-4 shadow"
                >
                  <div>
                    <strong>Mã lịch làm việc:</strong> {item.id}
                  </div>
                  <div>
                    <strong>Tên nhân viên:</strong>{' '}
                    {item.employee?.name || 'Chưa có thông tin'}
                  </div>
                  <div>
                    <strong>Tên sản phẩm:</strong>{' '}
                    {item.product?.name || 'Chưa xác định'}
                  </div>
                  <div>
                    <strong>Ca làm việc:</strong> {item.shift}
                  </div>
                  <div>
                    <strong>Ngày nhập:</strong>{' '}
                    {dayjs(item.date).format('DD-MM-YYYY')}
                  </div>
                  <div>
                    <strong>Trạng thái:</strong>{' '}
                    {(item.dailyQuantities?.length ?? 0) > 0 ? (
                      <Tag
                        color="green-inverse"
                        className="font-bold uppercase"
                      >
                        Đã nhập
                      </Tag>
                    ) : (
                      <Tag color="red-inverse" className="font-bold uppercase">
                        Chưa nhập
                      </Tag>
                    )}
                  </div>
                  <div>
                    <strong>Sản lượng:</strong>
                    <ul>
                      {item.dailyQuantities?.map((quantity) => (
                        <li key={quantity.id}>
                          {productStatusOptions.find(
                            (opt) => opt.value === quantity.status
                          )?.label || 'Chưa xác định'}
                          : {quantity.quantity} lúc{' '}
                          {quantity.created_at_formatted}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <Empty />
            )}
          </div>
          <Pagination {...pagination} />
        </Spin>
      ) : (
        <Table<DailyScheduleType> {...tableProps} />
      )}
    </ComponentCard>
  );
}
