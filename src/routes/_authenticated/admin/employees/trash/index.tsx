import { createFileRoute } from '@tanstack/react-router';
import { Avatar, Input, Table, TableColumnsType, TableProps } from 'antd';
import { useState } from 'react';

import { useCrudList } from '@/hooks/useCrudList';
import { EmployeeType } from '@/types/employeeType';
import { QueryParams } from '@/types/queryParams';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { ConfirmButton } from '@components/ui/CRUD/ConfirmButton';
import { employeeService } from '@services/EmployeeService';
import { convertImageName2Url } from '@utils/convertImageName2Url';

import RefreshButton from '@components/common/RefreshButton';
import { FaUser } from 'react-icons/fa';
import { debounce } from 'lodash';
import { customTableProps } from '@components/custom/TableProps.custom';

export const Route = createFileRoute('/_authenticated/admin/employees/trash/')({
  component: RouteComponent
});

function RouteComponent() {
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 10,
    include: ['role', 'calendarCategory']
  });

  const handleSearch = debounce((value: string, type: 'name' | 'code') => {
    setParams((prev) => ({
      ...prev,
      'filter[name]': undefined,
      'filter[id]': undefined
    }));
    if (!value) {
      return;
    }
    if (type == 'name') {
      setParams((prev) => ({
        ...prev,
        'filter[name]': value
      }));
    } else if (type == 'code') {
      setParams((prev) => ({
        ...prev,
        'filter[id]': value
      }));
    }
  }, 300);

  const {
    data: employees,
    pagination,
    queryResult: { isLoading, isFetching, refetch }
  } = useCrudList({
    service: employeeService,
    queryKey: 'employees',
    initialFilters: params,
    isTrash: true
  });

  const handleChange: TableProps<EmployeeType>['onChange'] = (
    pagination,
    filters,
    sorter
  ) => {
    // Sort
    let sortValue = undefined;
    if (!Array.isArray(sorter) && sorter.order && sorter.field) {
      sortValue = `${sorter.order === 'ascend' ? '' : '-'}${sorter.field}`;
    }

    // Filter
    const newFilters: QueryParams = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newFilters[`filter[${key}]`] = Array.isArray(value)
          ? String(value[0])
          : typeof value === 'boolean' || typeof value === 'bigint'
            ? String(value)
            : value;
      }
    });

    setParams((prev) => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
      sort: sortValue,
      ...newFilters
    }));
  };

  const columns: TableColumnsType<EmployeeType> = [
    {
      title: 'STT',
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      render: (_value, _record, index) =>
        index + 1 + (params.limit ?? 10) * ((params.page ?? 1) - 1)
    },
    {
      title: 'Tên/Điên Thoại',
      minWidth: 200,
      dataIndex: 'name',
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <Avatar
            src={convertImageName2Url(record.photo)}
            alt="avatar"
            icon={<FaUser />}
            shape="square"
            size={'large'}
          />
          <div className="text-nowrap">
            <div className="font-semibold">{value}</div>
            <div className="text-xs">{record.phone}</div>
          </div>
        </div>
      ),
      sorter: true
      // filterSearch: true
      // filters: [
      //   { text: 'Harry', value: 'harry' },
      //   { text: 'Ron', value: 'ron' },
      // ],
      // filteredValue: params['filter[name]'] ? [params['filter[name]'] as string] : null,
    },
    {
      title: 'Chức vụ',
      minWidth: 150,
      dataIndex: 'role',
      render: (_, record) => record.role?.role_name,
      key: 'role'
      // filters: [
      //   { text: 'Nhân viên', value: 'Nhân viên' },
      //   { text: 'Quản lý', value: 'Quản lý' }
      // ]
    },
    {
      title: 'Công ty ',
      minWidth: 120,
      dataIndex: 'company'
      // key: 'company',
      // filters: [
      //   { text: 'A7A', value: 'A7A' },
      //   { text: 'Vinh Vinh Phát', value: 'Vinh Vinh Phát' }
      // ]
    },
    {
      title: 'Mã nhân viên',
      minWidth: 110,
      align: 'center',
      dataIndex: 'id'
    },
    {
      title: 'Danh mục lịch làm việc',
      minWidth: 200,
      dataIndex: 'calendar_category',
      render: (_, record) => record.calendar_category?.name
    },
    {
      title: 'Hành động',
      minWidth: 100,
      align: 'center',
      render: (_value, _record) => {
        return (
          <div className="flex gap-2">
            <ConfirmButton
              isRestore={true}
              id={_record.id}
              service={employeeService}
              content={
                <p>
                  Bạn có chắc chắn muốn khôi phục nhân viên{' '}
                  <strong>
                    {_record.name} - {_record.id}
                  </strong>{' '}
                  không?
                </p>
              }
            />
          </div>
        );
      }
    }
  ];

  const tableProps: TableProps<EmployeeType> = {
    ...(customTableProps as unknown as TableProps<EmployeeType>),
    rowKey: (record) => ['employee', record.id].join('-'),
    columns: columns,
    dataSource: employees,
    loading: isLoading,
    pagination: {
      ...customTableProps.pagination,
      current: params.page,
      pageSize: params.limit,
      total: pagination.total,
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
    },
    onChange: handleChange
  };

  return (
    <div>
      <BackButton />
      <ComponentCard title="Danh sách nhân viên dã nghỉ việc">
        <RefreshButton refresh={refetch} isLoading={isFetching} />
        <div>
          <Input.Search
            className="max-w-3xs"
            placeholder="Tìm kiếm nhân viên"
            allowClear
            onChange={(e) => {
              const inputValue = e.target.value;
              if (/^\d+$/.test(inputValue)) {
                handleSearch(inputValue, 'code');
              } else {
                handleSearch(inputValue, 'name');
              }
            }}
          />
        </div>
        <Table<EmployeeType> {...tableProps} />
      </ComponentCard>
    </div>
  );
}
