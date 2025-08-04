import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Avatar,
  Button,
  Input,
  Table,
  TableColumnsType,
  TableProps
} from 'antd';
import { debounce } from 'lodash';
import { useState } from 'react';

import { useCrudList } from '@/hooks/useCrudList';
import { EmployeeType } from '@/types/employeeType';
import { QueryParams } from '@/types/queryParams';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { ConfirmButton } from '@components/ui/CRUD/ConfirmButton';
import { employeeService } from '@services/EmployeeService';
import { convertImageName2Url } from '@utils/convertImageName2Url';

import { customTableProps } from '@components/custom/TableProps.custom';
import { BiTrash } from 'react-icons/bi';
import { FaUser } from 'react-icons/fa';
import { FaFingerprint, FaPen } from 'react-icons/fa6';
import { LuUserRoundPlus } from 'react-icons/lu';

interface EmployeeTable extends EmployeeType {
  role?: { id: string; role_name: string };
}

export const Route = createFileRoute('/_authenticated/admin/employees/')({
  component: RouteComponent
});

function RouteComponent() {
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 10,
    include: ['role', 'calendarCategory']
  });

  const {
    data: employees,
    pagination,
    queryResult: { isLoading, isFetching, refetch }
  } = useCrudList({
    service: employeeService,
    queryKey: 'employees',
    initialFilters: params
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
            <Link to={`/admin/employees/edit/$id`} params={{ id: _record.id }}>
              <Button color="primary" variant="solid" icon={<FaPen />}>
                Sửa
              </Button>
            </Link>
            <ConfirmButton
              id={_record.id}
              service={employeeService}
              content={
                <p>
                  Bạn có chắc chắn muốn xóa nhân viên{' '}
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

  const tableProps: TableProps<EmployeeTable> = {
    ...(customTableProps as unknown as TableProps<EmployeeTable>),
    rowKey: (record) => ['employee', record.id, record.id].join('-'),
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

  const Actions = () => {
    return (
      <>
        <div className="flex flex-wrap gap-4">
          <RefreshButton refresh={refetch} isLoading={isFetching} />
          <Link to="/admin/employees/add">
            <Button
              color="green"
              variant="solid"
              icon={<LuUserRoundPlus />}
              size="large"
            >
              Thêm nhân viên
            </Button>
          </Link>
          <Link to="/admin/employees/trash">
            <Button
              color="gold"
              variant="solid"
              icon={<BiTrash />}
              size="large"
            >
              Đã xóa
            </Button>
          </Link>
          <Button variant="solid" icon={<FaFingerprint />} size="large">
            Thêm chấm công
          </Button>
        </div>
      </>
    );
  };

  return (
    <>
      <ComponentCard title="Danh sách nhân viên">
        <Actions />
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
        <Table<EmployeeType> {...tableProps} />
      </ComponentCard>
    </>
  );
}
