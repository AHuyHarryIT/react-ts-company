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
import { FaCalendarAlt, FaFilter } from 'react-icons/fa';
import { LoginHistoryItemType, HistoryFiltersType } from '@/types/historyType';
import { historyService } from '@/services/HistoryService';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { customTableProps } from '@components/custom/TableProps.custom';
import { STORAGE_URL } from '@/configs/environment.config';

export default function HistoryPage() {
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [activityTypes, setActivityTypes] = useState<string[]>([]);
  const [params, setParams] = useState({
    page: 1,
    limit: 50,
    date: dayjs().format('YYYY-MM-DD'),
    month: dayjs().format('MM-YYYY'),
    activity_types: [] as string[]
  });

  // Build params for API call - không filter activity_type ở server để lấy tất cả data
  const apiParams: HistoryFiltersType = {
    date: params.date,
    month: params.month
    // Bỏ activity_type để lấy tất cả data, filter ở client-side
  };

  const queryResult = useQuery({
    queryKey: ['history', apiParams],
    queryFn: () => historyService.getHistory(apiParams)
  });

  const { data } = queryResult;

  // Lấy tất cả data từ API
  const allLoginHistory = data?.loginHistory?.data || [];

  // Chỉ lấy activity types từ data của ngày hiện tại
  const finalActivityTypes = [
    ...new Set(allLoginHistory.map((item) => item.activity_type))
  ]
    .filter(Boolean)
    .sort();
  const filteredData = allLoginHistory.filter((item) => {
    const matchActivityTypes =
      activityTypes.length === 0 || activityTypes.includes(item.activity_type);

    return matchActivityTypes;
  });

  // Client-side pagination
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const dataSource = filteredData.slice(startIndex, endIndex);

  const pagination = {
    current: params.page,
    total: filteredData.length,
    pageSize: params.limit
  };

  // Reset to first page when filters change
  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      date: date.format('YYYY-MM-DD'),
      month: date.format('MM-YYYY'),
      activity_types: activityTypes
    }));
  }, [date, activityTypes]);

  const getActivityTypeColor = (type: string): string => {
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

    let hash = 0;
    for (let i = 0; i < type.length; i++) {
      const char = type.charCodeAt(i);
      hash = (hash << 7) + (hash << 1) + hash + char;
      hash = hash & 0x7fffffff;
    }
    hash += type.length * 37;
    const colorIndex = hash % colors.length;
    return colors[colorIndex];
  };

  const columns: TableColumnsType<LoginHistoryItemType> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_: unknown, __: LoginHistoryItemType, index: number) => (
        <span className="font-mono text-xs text-gray-500">
          {index + 1 + (params.limit ?? 10) * ((params.page ?? 1) - 1)}
        </span>
      )
    },
    {
      title: 'Nhân viên',
      key: 'employee',
      dataIndex: ['employee', 'photo'],
      width: 280,
      render: (value, record: LoginHistoryItemType) => (
        <div className="flex items-center gap-3 py-1">
          <Avatar
            icon={<UserOutlined />}
            src={`${STORAGE_URL}/${value}`}
            size={40}
            className="flex-shrink-0"
            style={{ backgroundColor: '#1890ff' }}
          />
          <div className="min-w-0 flex-1">
            <div className="mb-1 truncate text-sm font-medium text-gray-800 dark:text-white/90">
              {record.employee_name}
            </div>
            <Tag color="blue" className="!m-0 !font-mono !text-xs">
              {record.employee_code || record.employee_id || 'N/A'}
            </Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Hoạt động',
      key: 'activity',
      width: 140,
      render: (_: unknown, record: LoginHistoryItemType) => (
        <Tag
          color={getActivityTypeColor(record.activity_type)}
          className="font-medium"
        >
          {record.activity_type}
        </Tag>
      )
    },
    {
      title: 'Số lần',
      key: 'login_count',
      width: 100,
      align: 'center',
      render: (_: unknown, record: LoginHistoryItemType) => (
        <span className="text-lg font-semibold text-blue-600">
          {record.login_count}
        </span>
      )
    },
    {
      title: 'Mô tả',
      key: 'description',
      width: 300,
      render: (_: unknown, record: LoginHistoryItemType) => (
        <div className="py-1 text-sm text-gray-700 dark:text-gray-300">
          {record.description || (
            <span className="text-gray-400 italic">Không có mô tả</span>
          )}
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
          <div className="text-sm font-medium text-gray-800 dark:text-white/90">
            {dayjs(record.created_at).format('DD/MM/YYYY')}
          </div>
          <div className="text-xs text-gray-500">
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
      showSizeChanger: true,
      showTotal: (total, range) =>
        `Hiển thị ${range[0]}-${range[1]} của ${total} hoạt động`,
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
    <ComponentCard title="Lịch sử hoạt động">
      <div className="space-y-5">
        {/* ── Action Bar ──────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">
          <RefreshButton
            isLoading={queryResult.isFetching}
            refresh={queryResult.refetch}
          />
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 dark:border-gray-600 dark:bg-gray-800">
            <span className="text-xs text-gray-500">
              📅 {date.format('DD/MM/YYYY')}
            </span>
          </div>
        </div>

        {/* ── Stats Cards ─────────────────────────────────────────── */}
        {data && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 text-center dark:border-blue-900/50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="text-3xl font-bold text-blue-600">
                {Number(data.totalHistoryOverall || 0).toLocaleString('vi-VN')}
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Tổng hoạt động toàn bộ
              </div>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50 p-5 text-center dark:border-emerald-900/50 dark:from-emerald-900/20 dark:to-green-900/20">
              <div className="text-3xl font-bold text-emerald-600">
                {filteredData
                  .reduce((total, item) => total + item.login_count, 0)
                  .toLocaleString('vi-VN')}
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Hoạt động ngày hiện tại
              </div>
            </div>
          </div>
        )}

        {/* ── Filter Bar ──────────────────────────────────────────── */}
        <div className="rounded-xl border border-gray-100 bg-white/80 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                <FaCalendarAlt className="mr-1 inline-block text-blue-500" />
                Chọn ngày
              </label>
              <DatePicker
                placeholder="Chọn ngày"
                value={date}
                className="!rounded-lg"
                onChange={(value) => {
                  setDate(value ? value : dayjs());
                }}
              />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-1 lg:col-span-3">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                <FaFilter className="mr-1 inline-block text-purple-500" />
                Loại hoạt động
              </label>
              <Select
                mode="multiple"
                placeholder="Chọn loại hoạt động (có thể chọn nhiều)"
                value={activityTypes}
                onChange={setActivityTypes}
                allowClear
                className="!rounded-lg"
                maxTagCount={activityTypes.length >= 2 ? undefined : 1}
                style={{
                  width: '100%'
                }}
              >
                {finalActivityTypes.map((type: string) => (
                  <Select.Option key={type} value={type}>
                    <Tag color={getActivityTypeColor(type)} className="mr-2">
                      {type}
                    </Tag>
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────── */}
        <Table {...tableProps} />
      </div>
    </ComponentCard>
  );
}
