import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Table,
  DatePicker,
  Select,
  Button,
  Tag,
  Avatar,
  Typography,
  Row,
  Col,
  Statistic,
  Spin,
  Pagination
} from 'antd';
import {
  HistoryOutlined,
  UserOutlined,
  CalendarOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { LoginHistoryItemType, HistoryFiltersType } from '@/types/historyType';
import { historyService } from '@/services/HistoryService';

const { Title, Text } = Typography;

export default function HistoryPage() {
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [activityType, setActivityType] = useState<string | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Build params for API call - chỉ cần date, month, activity_type
  const params: HistoryFiltersType = {
    date: date.format('YYYY-MM-DD'),
    month: date.format('MM-YYYY'),
    activity_type: activityType
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['history', params],
    queryFn: () => historyService.getHistory(params)
  });

  // Reset to first page when filters change (date or activity type)
  useEffect(() => {
    setCurrentPage(1);
  }, [date, activityType]);

  // Lấy tất cả data từ API
  const allLoginHistory = data?.loginHistory?.data || [];

  // Debug: log data structure (chỉ log item đầu tiên)
  if (allLoginHistory.length > 0) {
    console.log('History data sample:', allLoginHistory[0]);
  }

  // Tạo danh sách activity types từ data thực tế trong ngày đó
  const availableActivityTypes = [
    ...new Set(allLoginHistory.map((item) => item.activity_type))
  ].sort(); // Client-side pagination - chia data thành từng trang
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = allLoginHistory.slice(startIndex, endIndex);

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

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center' as const,
      render: (_: unknown, __: LoginHistoryItemType, index: number) => (
        <Text className="font-medium text-gray-600">
          {(currentPage - 1) * pageSize + index + 1}
        </Text>
      )
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
      align: 'center' as const,
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
      align: 'center' as const,
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <Card className="mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-blue-100 p-3">
              <HistoryOutlined className="text-xl text-blue-600" />
            </div>
            <div>
              <Title level={3} className="m-0 text-gray-800">
                Lịch Sử Hoạt Động
              </Title>
              <Text className="text-gray-500">
                Theo dõi và quản lý hoạt động của nhân viên
              </Text>
            </div>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            className="flex items-center"
          >
            Làm mới
          </Button>
        </div>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="text-center shadow-sm">
            <Statistic title="Tổng số bản ghi" value={allLoginHistory.length} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center shadow-sm">
            <Statistic
              title="Trang hiện tại"
              value={currentPage}
              suffix={`/ ${Math.ceil(allLoginHistory.length / pageSize) || 1}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center shadow-sm">
            <Statistic
              title="Ngày được chọn"
              value={date.format('DD/MM/YYYY')}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CalendarOutlined className="text-gray-400" />
              <DatePicker
                value={date}
                onChange={(value) => value && setDate(value)}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
                allowClear={false}
                className="w-40"
              />
            </div>

            <Select
              placeholder="Chọn loại hoạt động"
              value={activityType}
              onChange={setActivityType}
              allowClear
              className="w-64"
            >
              {availableActivityTypes.map((type: string) => (
                <Select.Option key={type} value={type}>
                  <Tag color={getActivityTypeColor(type)} className="mr-2">
                    {type}
                  </Tag>
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Pagination ở bên phải - không có quick jumper */}
          <Pagination
            current={currentPage}
            total={allLoginHistory.length}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} của ${total} bản ghi`
            }
            pageSizeOptions={['20', '50', '100', '200']}
            onChange={(page, size) => {
              setCurrentPage(page);
              if (size && size !== pageSize) {
                setPageSize(size);
                setCurrentPage(1);
              }
            }}
            onShowSizeChange={(_current, size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="border border-gray-200 shadow-sm">
        <Spin spinning={isLoading}>
          <Table
            columns={columns}
            dataSource={paginatedData}
            rowKey="id"
            pagination={{
              current: currentPage,
              total: allLoginHistory.length,
              pageSize: pageSize,
              showSizeChanger: true,
              showTotal: (total: number, range: [number, number]) =>
                `${range[0]}-${range[1]} của ${total} bản ghi`,
              pageSizeOptions: ['20', '50', '100', '200'],
              onChange: (page: number, size?: number) => {
                setCurrentPage(page);
                if (size && size !== pageSize) {
                  setPageSize(size);
                  setCurrentPage(1); // Reset to first page when page size changes
                }
              },
              onShowSizeChange: (_current: number, size: number) => {
                setPageSize(size);
                setCurrentPage(1); // Reset to first page when page size changes
              }
            }}
            className="overflow-x-auto"
            scroll={{ x: 1200 }}
            size="middle"
            bordered={true}
            rowClassName="hover:bg-gray-50"
          />
        </Spin>
      </Card>
    </div>
  );
}
