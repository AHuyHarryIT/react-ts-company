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
      width: 80,
      align: 'center',
      render: (_: unknown, __: LoginHistoryItemType, index: number) =>
        index + 1 + (params.limit ?? 10) * ((params.page ?? 1) - 1)
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
            <div className="mb-1 truncate text-sm font-medium text-gray-900">
              {record.employee_name}
            </div>
            <div className="text-xs text-gray-500">
              Mã NV: {record.employee_code || record.employee_id || 'N/A'}
            </div>
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
      title: 'Số lần thao tác',
      key: 'login_count',
      width: 140,
      align: 'center',
      render: (_: unknown, record: LoginHistoryItemType) => (
        <div className="text-center">
          <span className="text-lg font-semibold text-blue-600">
            {record.login_count}
          </span>
          <div className="text-xs text-gray-500"></div>
        </div>
      )
    },
    {
      title: 'Mô tả',
      key: 'description',
      width: 300,
      render: (_: unknown, record: LoginHistoryItemType) => (
        <div className="py-1 text-sm text-gray-700">
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
          <div className="text-sm font-medium text-gray-900">
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
    <>
      <ComponentCard title={`Lịch Sử Hoạt Động - ${date.format('DD-MM-YYYY')}`}>
        <RefreshButton
          isLoading={queryResult.isFetching}
          refresh={queryResult.refetch}
        />

        {/* Thông tin tổng quan */}
        {data && (
          <section className="mb-4 rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Number(data.totalHistoryOverall || 0).toLocaleString(
                    'vi-VN'
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Tổng hoạt động toàn bộ
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredData
                    .reduce((total, item) => total + item.login_count, 0)
                    .toLocaleString('vi-VN')}
                </div>
                <div className="text-sm text-gray-600">
                  Hoạt động ngày hiện tại
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mb-4 flex flex-wrap gap-4">
          <DatePicker
            placeholder="Chọn ngày"
            value={date}
            onChange={(value) => {
              setDate(value ? value : dayjs());
            }}
            className="shadow-sm"
          />
          <Select
            mode="multiple"
            className="shadow-sm"
            placeholder="Chọn loại hoạt động (có thể chọn nhiều)"
            value={activityTypes}
            onChange={setActivityTypes}
            allowClear
            maxTagCount={activityTypes.length >= 2 ? undefined : 1}
            style={{
              minWidth: '320px',
              width: activityTypes.length >= 2 ? 'auto' : '320px',
              maxWidth: '600px'
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
        </section>

        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <Table {...tableProps} />
        </div>
      </ComponentCard>
    </>
  );
}
