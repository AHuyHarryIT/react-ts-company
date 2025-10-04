import React from 'react';
import { Card, Row, Col, Select, DatePicker, Button, Space } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  type RequestFormFilters as RequestFormFiltersType,
  REQUEST_FORM_TYPES,
  REQUEST_FORM_STATUSES
} from '@/types/requestFormType';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface RequestFormFiltersProps {
  filters: RequestFormFiltersType;
  onFiltersChange: (filters: RequestFormFiltersType) => void;
  onClearFilters: () => void;
  isAdmin?: boolean;
}

export const RequestFormFilterPanel: React.FC<RequestFormFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const handleFilterChange = (
    key: keyof RequestFormFiltersType,
    value: unknown
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filters change
    });
  };

  const handleDateRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null
  ) => {
    if (dates && dates[0] && dates[1]) {
      onFiltersChange({
        ...filters,
        from_date: dates[0].format('YYYY-MM-DD'),
        to_date: dates[1].format('YYYY-MM-DD'),
        page: 1
      });
    } else {
      onFiltersChange({
        ...filters,
        from_date: undefined,
        to_date: undefined,
        page: 1
      });
    }
  };

  return (
    <Card className="mb-4">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Loại đơn
            </label>
            <Select
              placeholder="Chọn loại đơn"
              allowClear
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
              className="w-full"
            >
              {Object.entries(REQUEST_FORM_TYPES).map(([key, label]) => (
                <Option key={key} value={key}>
                  {label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Trạng thái
            </label>
            <Select
              placeholder="Chọn trạng thái"
              allowClear
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              className="w-full"
            >
              {Object.entries(REQUEST_FORM_STATUSES).map(([key, label]) => (
                <Option key={key} value={key}>
                  {label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Khoảng thời gian
            </label>
            <RangePicker
              value={
                filters.from_date && filters.to_date
                  ? [dayjs(filters.from_date), dayjs(filters.to_date)]
                  : null
              }
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              className="w-full"
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </div>
        </Col>

        <Col xs={24} sm={12} md={4}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">&nbsp;</label>
            <Space className="flex w-full">
              <Button
                type="default"
                icon={<ClearOutlined />}
                onClick={onClearFilters}
                className="flex-1"
              >
                Xóa bộ lọc
              </Button>
            </Space>
          </div>
        </Col>
      </Row>
    </Card>
  );
};
