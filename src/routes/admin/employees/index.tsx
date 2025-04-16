import { createFileRoute, Link } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import {
  Avatar,
  Button,
  Table,
  TableColumnsType,
  TableProps,
  Tooltip
} from 'antd';
import { useState } from 'react';

import { useCrudList } from '@/hooks/useCrudList';
import { EmployeeType } from '@/types/employeeType';
import { QueryParams } from '@/types/queryParams';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { DeleteButton } from '@components/ui/CRUD/ConfirmButton';
import { employeeService } from '@services/EmployeeService';
import { uiStore } from '@stores/uiStore';
import { convertImageName2Url } from '@utils/convertImageName2Url';

import { BiTrash } from 'react-icons/bi';
import { FaUser } from 'react-icons/fa';
import { FaFingerprint, FaPen } from 'react-icons/fa6';
import { LuUserRoundPlus } from 'react-icons/lu';

interface EmployeeTable extends EmployeeType {
  role?: { id: string; role_name: string };
  category_celender?: { id: string; name: string };
}

export const Route = createFileRoute('/admin/employees/')({
  component: RouteComponent
});

function RouteComponent() {
  const { isMobile } = useStore(uiStore);

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
    initialFilters: params
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
            <Link to={`/admin/employees/edit/$id`} params={{ id: _record.id }}>
              <Button color="primary" variant="solid" icon={<FaPen />}>
                Sửa
              </Button>
            </Link>
            <DeleteButton
              id={_record.id}
              service={employeeService}
              content={
                <p>
                  Bạn có chắc chắn muốn xóa nhân viên{' '}
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

  const Actions = () => {
    return (
      <>
        <div className="flex flex-wrap gap-4">
          <RefreshButton refresh={refetch} isLoading={isFetching} />
          <Tooltip title="Thêm nhân viên">
            <Link to="/admin/employees/add">
              <Button
                color="green"
                variant="solid"
                icon={<LuUserRoundPlus />}
                size="large"
              >
                {!isMobile && <>Thêm</>}
              </Button>
            </Link>
          </Tooltip>
          <Tooltip title="Đã xóa">
            <Link to="/admin/employees/trash">
              <Button
                color="gold"
                variant="solid"
                icon={<BiTrash />}
                size="large"
              >
                {!isMobile && <>Đã xóa</>}
              </Button>
            </Link>
          </Tooltip>
          <Tooltip title="Thêm chấm công">
            <Button variant="solid" icon={<FaFingerprint />} size="large">
              {!isMobile && <>Thêm chấm công</>}
            </Button>
          </Tooltip>
        </div>
      </>
    );
  };

  return (
    <>
      <ComponentCard title="Danh sách nhân viên">
        <Actions />
        <Table<EmployeeType> {...tableProps} />
      </ComponentCard>
    </>
  );
}
