import { createFileRoute } from '@tanstack/react-router';
import { Avatar, Table, TableColumnsType, TableProps } from 'antd';
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

interface EmployeeTable extends EmployeeType {
  role?: { id: string; role_name: string };
  category_celender?: { id: string; name: string };
}

export const Route = createFileRoute('/_authenticated/admin/employees/trash/')({
  component: RouteComponent
});

function RouteComponent() {
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 10,
    include: ['role', 'category_celender']
  });

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

  const handleChange: TableProps<EmployeeTable>['onChange'] = (
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

  const columns: TableColumnsType<EmployeeTable> = [
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
      dataIndex: 'code'
    },
    {
      title: 'Danh mục lịch làm việc',
      minWidth: 200,
      dataIndex: 'category_celender',
      render: (_, record) => record.category_celender?.name
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
                    {_record.name} - {_record.code}
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

  const tableProps: TableProps<EmployeeTable> = {
    rowKey: (record) => ['employee', record.id, record.code].join('-'),
    bordered: true,
    columns: columns,
    dataSource: employees,
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
      showTotal: (total) => `Tổng ${total} nhân viên`,
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

        <Table<EmployeeType> {...tableProps} />
      </ComponentCard>
    </div>
  );
}
