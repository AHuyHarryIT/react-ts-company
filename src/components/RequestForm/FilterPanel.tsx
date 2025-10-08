import React from 'react';
import { Card, Row, Col, Select, Button } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import {
  type RequestFormFilters as RequestFormFiltersType,
  REQUEST_FORM_TYPES,
  REQUEST_FORM_STATUSES
} from '@/types/requestFormType';

const { Option } = Select;

interface RequestFormFiltersProps {
  filters: RequestFormFiltersType;
  onFiltersChange: (filters: RequestFormFiltersType) => void;
  onClearFilters: () => void;
  isAdmin?: boolean;
}

export const FilterPanel: React.FC<RequestFormFiltersProps> = ({
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

  return (
    <Card className="mb-4">
      <Row gutter={[12, 12]} align="middle" justify="start">
        <Col xs={24} sm={8} md={6}>
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

        <Col xs={24} sm={8} md={6}>
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

        <Col xs={24} sm={8} md={4}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">&nbsp;</label>
            <Button
              type="default"
              icon={<ClearOutlined />}
              onClick={onClearFilters}
              className="w-full"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );
};
