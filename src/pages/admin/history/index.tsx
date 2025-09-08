import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  DatePicker,
  Select,
  Tag,
  Avatar,
  TableColumnsType,
  TableProps
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { LoginHistoryItemType, HistoryFiltersType } from '@/types/historyType';
import { historyService } from '@/services/HistoryService';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { customTableProps } from '@components/custom/TableProps.custom';

export default function HistoryPage() {
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [activityType, setActivityType] = useState<string | undefined>(
    undefined
  );
  const [params, setParams] = useState({
    page: 1,
    limit: 50,
    date: dayjs().format('YYYY-MM-DD'),
    month: dayjs().format('MM-YYYY'),
    activity_type: undefined as string | undefined
  });

  // Build params for API call
  const apiParams: HistoryFiltersType = {
    date: params.date,
    month: params.month,
    activity_type: params.activity_type
  };

  const queryResult = useQuery({
    queryKey: ['history', apiParams],
    queryFn: () => historyService.getHistory(apiParams)
  });

  const { data } = queryResult;

  // Lấy tất cả data từ API
  const allLoginHistory = data?.loginHistory?.data || [];

  // Client-side pagination
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const dataSource = allLoginHistory.slice(startIndex, endIndex);

  const pagination = {
    current: params.page,
    total: allLoginHistory.length,
    pageSize: params.limit
  };

  // Reset to first page when filters change
  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      date: date.format('YYYY-MM-DD'),
      month: date.format('MM-YYYY'),
      activity_type: activityType
    }));
  }, [date, activityType]);

  // Debug: log data structure (chỉ log item đầu tiên)
  if (allLoginHistory.length > 0) {
    console.log('History data sample:', allLoginHistory[0]);
  }

  // Tạo danh sách activity types từ data thực tế trong ngày đó
  const availableActivityTypes = [
    ...new Set(allLoginHistory.map((item) => item.activity_type))
  ].sort();

  const getActivityTypeColor = (type: string): string => {
    // Danh sách màu mềm mại và dễ nhìn
    const colors = [
      'blue',
      'green',
      'purple',
      'orange',
      'cyan',
      'geekblue',
      'default',
      'processing',
      'success',
      'warning',
      '#52c41a',
      '#1890ff',
      '#722ed1',
      '#fa8c16',
      '#13c2c2',
      '#2f54eb',
      '#389e0d',
      '#d4b106',
      '#d46b08',
      '#08979c',
      '#531dab',
      '#1d39c4',
      '#7cb305',
      '#ad6800',
      '#006d75',
      '#10239e',
      '#135200',
      '#ad4e00',
      '#003a8c',
      '#003d82'
    ];

    // Tạo hash phức tạp hơn để phân bố màu đều
    let hash = 0;
    for (let i = 0; i < type.length; i++) {
      const char = type.charCodeAt(i);
      hash = (hash << 7) + (hash << 1) + hash + char;
      hash = hash & 0x7fffffff; // Đảm bảo số dương
    }

    // Thêm seed từ độ dài string để tăng sự đa dạng
    hash += type.length * 37;

    // Lấy index dựa trên hash
    const colorIndex = hash % colors.length;
    return colors[colorIndex];
  };

  const columns: TableColumnsType<LoginHistoryItemType> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_: unknown, __: LoginHistoryItemType, index: number) =>
        index + 1 + (params.limit ?? 10) * ((params.page ?? 1) - 1)
    },
    {
      title: 'Nhân viên',
      key: 'employee',
      width: 250,
      render: (_: unknown, record: LoginHistoryItemType) => (
        <div className="flex items-center space-x-3">
          <Avatar
            icon={<UserOutlined />}
            size="default"
            className="flex-shrink-0 bg-blue-500"
          />
          <div className="mx-2 min-w-0 flex-1">
            <div className="truncate font-medium text-gray-900">
              {record.employee_name}
            </div>
            <div className="text-sm text-gray-500">
              Mã NV: {record.employee_code || record.employee_id || 'N/A'}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Hoạt động',
      key: 'activity',
      width: 120,
      render: (_: unknown, record: LoginHistoryItemType) => (
        <div className="space-y-1">
          <Tag
            color={getActivityTypeColor(record.activity_type)}
            className="font-medium"
          >
            {record.activity_type}
          </Tag>
        </div>
      )
    },
    {
      title: 'Số lần đăng nhập',
      key: 'login_count',
      width: 150,
      align: 'center',
      render: (_: unknown, record: LoginHistoryItemType) => (
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <span className="text-lg font-bold text-blue-600">
              {record.login_count}
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-500">lần</div>
        </div>
      )
    },
    {
      title: 'Thời gian',
      key: 'time',
      width: 160,
      align: 'center',
      render: (_: unknown, record: LoginHistoryItemType) => (
        <div className="text-center">
          <div className="font-medium text-gray-900">
            {dayjs(record.created_at).format('DD/MM/YYYY')}
          </div>
          <div className="text-sm text-gray-500">
            {dayjs(record.created_at).format('HH:mm:ss')}
          </div>
        </div>
      )
    }
  ];

  const tableProps: TableProps<LoginHistoryItemType> = {
    ...(customTableProps as unknown as TableProps<LoginHistoryItemType>),
    rowKey: 'id',
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
          limit: size,
          page: 1
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
      <ComponentCard title={`Lịch Sử Hoạt Động - ${date.format('DD-MM-YYYY')}`}>
        <RefreshButton
          isLoading={queryResult.isFetching}
          refresh={queryResult.refetch}
        />
        <section className="flex flex-wrap gap-2">
          <DatePicker
            placeholder="Chọn ngày"
            value={date}
            onChange={(value) => {
              setDate(value ? value : dayjs());
            }}
          />
          <Select
            className="min-w-64"
            placeholder="Chọn loại hoạt động"
            value={activityType}
            onChange={setActivityType}
            allowClear
          >
            {availableActivityTypes.map((type: string) => (
              <Select.Option key={type} value={type}>
                <Tag color={getActivityTypeColor(type)} className="mr-2">
                  {type}
                </Tag>
              </Select.Option>
            ))}
          </Select>
        </section>

        <Table {...tableProps} />
      </ComponentCard>
    </>
  );
}
