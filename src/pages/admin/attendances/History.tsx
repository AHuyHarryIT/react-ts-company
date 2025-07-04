import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
  Button,
  Collapse,
  DatePicker,
  Input,
  Select,
  Space,
  Table,
  TableColumnsType,
  TableProps,
  Tooltip
} from 'antd';
import { useState } from 'react';

import { AttendanceType } from '@/types/attendanceType';
import { QueryParams } from '@/types/queryParams';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { IconAdd, IconFilter } from '@components/icons';
import { useCrudList } from '@hooks/useCrudList';
import { attendanceService } from '@services/AttendanceService';
import { fetchWorkScheduleCategories } from '@services/WorkScheduleCategoryService';
import { FaTable } from 'react-icons/fa6';

type TableColumns = AttendanceType;
const initialParams: QueryParams = {
  page: 1,
  limit: 50
};

export const History = () => {
  const [params, setParams] = useState<QueryParams>(initialParams);
  const [searchOn, setSearchOn] = useState<'name' | 'code'>('name');

  const {
    data: attendances,
    pagination,
    queryResult: { isLoading, isFetching, refetch }
  } = useCrudList({
    service: attendanceService,
    queryKey: 'attendances',
    initialFilters: params
  });

  const { data: categories, refetch: refetchCategories } = useQuery({
    queryKey: ['workScheduleCategories', { limit: 0 }],
    queryFn: () => fetchWorkScheduleCategories({ limit: 0 })
  });

  const categoryOptions = categories?.workScheduleCategories.map((item) => ({
    label: item.name,
    value: item.id
  }));

  const columns: TableColumnsType<TableColumns> = [
    {
      title: 'STT',
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      render: (_value, _record, index) =>
        index + 1 + (params.limit ?? 10) * ((params.page ?? 1) - 1)
    },
    {
      title: 'Mã nhân viên',
      dataIndex: 'employee_code',
      minWidth: 120,
      ellipsis: true
    },
    {
      title: 'Tên nhân viên',
      key: 'employeeName',
      minWidth: 200,
      ellipsis: true,
      render: (_value, record) => {
        return record.employee?.name || 'Chưa có thông tin';
      }
    },
    {
      title: 'Thời gian chấm công',
      dataIndex: 'datetime',
      key: 'datetime',
      minWidth: 150,
      ellipsis: true,
      render: (value) => {
        if (!value) return null;
        return new Date(value).toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
    },
    {
      title: 'Danh mục làm việc',
      key: 'workScheduleCategory',
      width: 200,
      ellipsis: true,
      render: (_value, record) => {
        return (
          categories?.workScheduleCategories.find(
            (item) => item.id === record.employee?.category_celender_id
          )?.name || 'Chưa có thông tin'
        );
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      align: 'center',
      render: () => (
        // TODO: enhance actions
        <>
          <Tooltip title="Xem chi tiết">
            {/* <Link to={`/admin/attendances/${record.employeeCode}`}> */}
            <Button type="link">Chi tiết</Button>
            {/* </Link> */}
          </Tooltip>
        </>
      )
    }
  ];

  const tableProps: TableProps<TableColumns> = {
    rowKey: (record) =>
      ['attendances', record.id, record.employee_code].join('-'),
    bordered: true,
    columns: columns,
    dataSource: attendances,
    loading: isLoading,
    size: 'small',
    scroll: { x: 'max-content', y: 'calc(100vh - 300px)' },
    tableLayout: 'auto',
    pagination: {
      size: 'default',
      showSizeChanger: true,
      current: params.page,
      pageSize: params.limit,
      total: pagination.total,
      pageSizeOptions: ['10', '20', '50', '100', '200', '500'],
      showTotal: (total) => `Tổng ${total} dòng`,
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
    <ComponentCard title="Lịch sử chấm công">
      <div className="flex flex-wrap gap-4">
        <RefreshButton
          refresh={() => {
            refetch();
            refetchCategories();
          }}
          isLoading={isFetching}
        />
        <Tooltip title="Thêm dữ liệu chấm công">
          {/* <Link to="/admin/employees/add"> */}
          <Button color="green" variant="solid" icon={<IconAdd />} size="large">
            Thêm dữ liệu chấm công
          </Button>
          {/* </Link> */}
        </Tooltip>
        <Tooltip title="Bảng tính công">
          <Link to="/admin/attendances/sheet">
            <Button
              color="blue"
              variant="solid"
              icon={<FaTable />}
              size="large"
            >
              Bảng tính công
            </Button>
          </Link>
        </Tooltip>
      </div>
      <Collapse
        style={{ marginBottom: '1.5rem' }}
        items={[
          {
            key: 'filter',
            label: (
              <div className="flex items-center gap-1">
                <IconFilter /> Bộ lọc
              </div>
            ),
            children: (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <DatePicker
                  picker="month"
                  format="YYYY-MM"
                  placeholder="Chọn tháng"
                  onChange={(_value, dateString) => {
                    setParams((prev) => ({
                      ...prev,
                      month: dateString ? dateString : undefined
                    }));
                  }}
                />
                <Select
                  options={categoryOptions}
                  placeholder="Chọn danh mục"
                  popupMatchSelectWidth={false}
                  allowClear
                  onSelect={(value) => {
                    setParams((prev) => ({
                      ...prev,
                      'filter[employee.category_celender_id]': value
                    }));
                  }}
                  onClear={() => {
                    setParams((prev) => ({
                      ...prev,
                      'filter[employee.category_celender_id]': undefined
                    }));
                  }}
                />
                <Space.Compact className="col-span-1 sm:col-span-2">
                  <Select
                    defaultValue={searchOn}
                    options={[
                      { label: 'Tên', value: 'name' },
                      { label: 'Mã', value: 'code' }
                    ]}
                    onChange={(value) => {
                      setSearchOn(value);
                    }}
                  />
                  <Input.Search
                    placeholder="Tìm kiếm nhân viên"
                    allowClear
                    onSearch={(value) => {
                      setParams((prev) => ({
                        ...prev,
                        'filter[employee.code]': undefined,
                        'filter[employee.name]': undefined
                      }));
                      if (searchOn === 'code') {
                        setParams((prev) => ({
                          ...prev,
                          'filter[employee.code]': value ? value : undefined
                        }));
                      } else {
                        setParams((prev) => ({
                          ...prev,
                          'filter[employee.name]': value ? value : undefined
                        }));
                      }
                    }}
                  />
                </Space.Compact>
              </div>
            ),
            showArrow: false
          }
        ]}
      />
      <Table<TableColumns> {...tableProps} />
    </ComponentCard>
  );
};
