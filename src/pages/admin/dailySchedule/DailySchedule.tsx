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
import {
  FaCalendarAlt,
  FaExpandArrowsAlt,
  FaCompressArrowsAlt
} from 'react-icons/fa';

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
      width: 60,
      render: (_value, _record, index) => (
        <span className="font-mono text-xs text-gray-500">
          {index + 1 + (params.limit ?? 50) * ((params.page ?? 1) - 1)}
        </span>
      )
    },
    {
      title: 'Mã lịch',
      key: 'id',
      dataIndex: 'id',
      align: 'center',
      render: (value) => (
        <Tag color="blue" className="!font-mono !text-xs">
          {value}
        </Tag>
      )
    },
    {
      title: 'Mã nhân viên',
      key: 'employee_id',
      dataIndex: 'employee_id',
      align: 'center',
      render: (value) => (
        <Tag color="geekblue" className="!font-mono !text-xs">
          {value}
        </Tag>
      )
    },
    {
      title: 'Tên nhân viên',
      key: 'name',
      dataIndex: ['employee', 'name'],
      render: (value) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {value || (
            <span className="text-gray-400 italic">Chưa có thông tin</span>
          )}
        </span>
      )
    },
    {
      title: 'Tên sản phẩm',
      key: 'product_name',
      dataIndex: ['product', 'name'],
      render: (value) => (
        <span className="text-sm">
          {value || <span className="text-gray-300">—</span>}
        </span>
      )
    },
    {
      title: 'Ca làm việc',
      dataIndex: 'shift',
      align: 'center',
      render: (value) => {
        if (value === 1) return <Tag color="blue">Ca 1</Tag>;
        if (value === 2) return <Tag color="purple">Ca 2</Tag>;
        return <span className="text-gray-300">—</span>;
      }
    },
    {
      title: 'Ngày nhập',
      key: 'date',
      dataIndex: 'date',
      align: 'center',
      render: (value) => (
        <span className="text-sm">{dayjs(value).format('DD-MM-YYYY')}</span>
      )
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
      width: 120,
      render: (_value, record) => (
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
      )
    }
  ];

  const expandColumns: TableColumnsType<DailyQuantitiesType> = [
    {
      title: 'Loại sản phẩm',
      key: 'working',
      dataIndex: ['status'],
      render: (value) => (
        <Tag color="geekblue">
          {productStatusOptions.find((item) => item.value === value)?.label ||
            'Chưa xác định'}
        </Tag>
      )
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      dataIndex: ['quantity'],
      render: (value) => {
        if (!value) return <span className="text-gray-300">—</span>;
        return (
          <span className="font-semibold text-blue-600">
            {value.toLocaleString('en-US', {
              maximumFractionDigits: 0
            })}
          </span>
        );
      }
    },
    {
      title: 'Thời gian kết thúc',
      key: 'end_time',
      align: 'center',
      dataIndex: ['created_at_formatted'],
      render: (value) => {
        return (
          <Tag color="green" className="!text-xs">
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
      <div className="space-y-5">
        {/* ── Action Bar ──────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">
          {!isMobile && (
            <Button
              type={isAllExpanded ? 'default' : 'primary'}
              onClick={handleToggleAll}
              icon={
                isAllExpanded ? <FaCompressArrowsAlt /> : <FaExpandArrowsAlt />
              }
              className="min-w-[120px]"
            >
              {isAllExpanded ? 'Đóng tất cả' : 'Mở tất cả'}
            </Button>
          )}
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 dark:border-gray-600 dark:bg-gray-800">
            <span className="text-xs text-gray-500">
              📅 {dayjs(params['filter[date]']).format('DD/MM/YYYY')}
            </span>
          </div>
        </div>

        {/* ── Filter Bar ──────────────────────────────────────────── */}
        <div className="rounded-xl border border-gray-100 bg-white/80 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                <FaCalendarAlt className="mr-1 inline-block text-blue-500" />
                Chọn ngày
              </label>
              <DatePicker
                id="admin-date-picker"
                placeholder="Chọn ngày"
                value={dayjs(params['filter[date]'])}
                className="!rounded-lg"
                onChange={(date) => {
                  setParams((prev) => ({
                    ...prev,
                    'filter[date]': date ? date.format('YYYY-MM-DD') : undefined
                  }));
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────── */}
        {isMobile ? (
          <Spin spinning={isLoading}>
            <Pagination {...pagination} />
            <div className="my-6 flex flex-col gap-4">
              {response?.data && response.data.length > 0 ? (
                response.data.map((item) => (
                  <div
                    key={`admin_activity_card-${item.id}`}
                    className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Tag color="blue" className="!font-mono !text-xs">
                        {item.id}
                      </Tag>
                      {(item.dailyQuantities?.length ?? 0) > 0 ? (
                        <Tag
                          color="green-inverse"
                          className="font-bold uppercase"
                        >
                          Đã nhập
                        </Tag>
                      ) : (
                        <Tag
                          color="red-inverse"
                          className="font-bold uppercase"
                        >
                          Chưa nhập
                        </Tag>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">
                          Nhân viên:
                        </span>{' '}
                        <span className="font-medium text-gray-800">
                          {item.employee?.name || 'Chưa có thông tin'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Sản phẩm:
                        </span>{' '}
                        {item.product?.name || 'Chưa xác định'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Ca:</span>{' '}
                        {Number(item.shift) === 1 ? (
                          <Tag color="blue">Ca 1</Tag>
                        ) : (
                          <Tag color="purple">Ca 2</Tag>
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Ngày:</span>{' '}
                        {dayjs(item.date).format('DD-MM-YYYY')}
                      </div>
                    </div>
                    {(item.dailyQuantities?.length ?? 0) > 0 && (
                      <div className="mt-3 border-t border-gray-100 pt-3">
                        <span className="text-xs font-medium text-gray-500">
                          Sản lượng:
                        </span>
                        <ul className="mt-1 space-y-1">
                          {item.dailyQuantities?.map((quantity) => (
                            <li
                              key={quantity.id}
                              className="flex items-center gap-2 text-xs"
                            >
                              <Tag color="geekblue" className="!text-xs">
                                {productStatusOptions.find(
                                  (opt) => opt.value === quantity.status
                                )?.label || 'Chưa xác định'}
                              </Tag>
                              <span className="font-semibold text-blue-600">
                                {quantity.quantity}
                              </span>
                              <span className="text-gray-400">
                                lúc {quantity.created_at_formatted}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
      </div>
    </ComponentCard>
  );
}
