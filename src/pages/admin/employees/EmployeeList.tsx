import { Link } from '@tanstack/react-router';
import {
  Avatar,
  Button,
  Input,
  Modal,
  Table,
  TableColumnsType,
  TableProps,
  Tag
} from 'antd';
import { debounce } from 'lodash';
import { useState } from 'react';
import { FaUser, FaSearch } from 'react-icons/fa';
import { FaFingerprint, FaPen } from 'react-icons/fa6';
import { LuUserRoundPlus } from 'react-icons/lu';
import { BiTrash } from 'react-icons/bi';

import { useCrudList } from '@/hooks/useCrudList';
import { EmployeeType } from '@/types/employeeType';
import { QueryParams } from '@/types/queryParams';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { ConfirmButton } from '@components/ui/CRUD/ConfirmButton';
import { employeeService } from '@services/EmployeeService';

import { STORAGE_URL } from '@/configs/environment.config';
import { customTableProps } from '@components/custom/TableProps.custom';

export default function EmployeeList() {
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

  const handleChange: TableProps<EmployeeType>['onChange'] = (
    _pagination,
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
      sort: sortValue,
      ...newFilters
    }));
  };

  const handleAttendanceClick = () => {
    Modal.confirm({
      title: 'Thông báo',
      content: 'Bạn vui lòng đổi mạng Vinh Vinh Phát để tiếp tục',
      okText: 'Tiếp tục',
      cancelText: 'Hủy',
      onOk: () => {
        window.open('http://192.168.1.200/doc/index.html#/dashboard', '_blank');
      }
    });
  };

  const columns: TableColumnsType<EmployeeType> = [
    {
      title: 'STT',
      rowScope: 'row',
      width: 60,
      align: 'center',
      render: (_value, _record, index) => (
        <span className="font-mono text-xs text-gray-500">
          {index + 1 + (params.limit ?? 10) * ((params.page ?? 1) - 1)}
        </span>
      )
    },
    {
      title: 'Nhân viên',
      minWidth: 200,
      dataIndex: 'name',
      render: (value, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={`${STORAGE_URL}/${record.card_photo}`}
            alt="avatar"
            icon={<FaUser />}
            shape="square"
            size={'large'}
            className="flex-shrink-0"
          />
          <div className="text-nowrap">
            <div className="font-medium text-gray-800 dark:text-white/90">
              {value}
            </div>
            <div className="text-xs text-gray-500">{record.phone}</div>
          </div>
        </div>
      ),
      sorter: true
    },
    {
      title: 'Mã NV',
      width: 110,
      align: 'center',
      dataIndex: 'id',
      render: (value) => (
        <Tag color="blue" className="!font-mono !text-xs">
          {value}
        </Tag>
      )
    },
    {
      title: 'Chức vụ',
      minWidth: 150,
      dataIndex: 'role',
      render: (_, record) => {
        const roleName = record.role?.role_name;
        return roleName ? (
          <Tag color="geekblue">{roleName}</Tag>
        ) : (
          <span className="text-gray-400 italic">Chưa có</span>
        );
      },
      key: 'role'
    },
    {
      title: 'Công ty',
      minWidth: 120,
      dataIndex: ['company'],
      key: 'company',
      render: (_, record) => {
        const company = record.company?.toUpperCase();
        if (company == 'VVP') {
          return <Tag color="purple">VINH VINH PHÁT</Tag>;
        } else if (company == 'A7A') {
          return <Tag color="cyan">A7A</Tag>;
        } else {
          return company ? (
            <Tag>{company}</Tag>
          ) : (
            <span className="text-gray-300">—</span>
          );
        }
      }
    },
    {
      title: 'Danh mục lịch LV',
      minWidth: 180,
      dataIndex: 'calendar_category',
      render: (_, record) => {
        const catName = record.calendar_category?.name;
        return catName ? (
          <Tag color="green">{catName}</Tag>
        ) : (
          <span className="text-gray-400 italic">Chưa có</span>
        );
      }
    },
    {
      title: 'Hành động',
      width: 160,
      align: 'center',
      render: (_value, _record) => {
        return (
          <div className="flex items-center justify-center gap-2">
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

  const tableProps: TableProps<EmployeeType> = {
    ...(customTableProps as unknown as TableProps<EmployeeType>),
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

  return (
    <ComponentCard title="Quản lý nhân viên">
      <div className="space-y-5">
        {/* ── Action Bar ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">
          <RefreshButton refresh={refetch} isLoading={isFetching} />
          <Link to="/admin/employees/add">
            <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md active:scale-[0.97]">
              <LuUserRoundPlus className="text-sm" />
              Thêm nhân viên
            </button>
          </Link>
          <Link to="/admin/employees/trash">
            <button className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 shadow-sm transition-all hover:bg-amber-100 hover:shadow-md active:scale-[0.97] dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              <BiTrash className="text-sm" />
              Thùng rác
            </button>
          </Link>
          <button
            onClick={handleAttendanceClick}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-700 hover:shadow-md active:scale-[0.97]"
          >
            <FaFingerprint className="text-sm" />
            Thêm chấm công
          </button>
          {/* Employee count badge */}
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 dark:border-gray-600 dark:bg-gray-800">
            <span className="text-xs text-gray-500">
              👥 Tổng:{' '}
              <strong className="text-blue-600">{pagination.total || 0}</strong>{' '}
              nhân viên
            </span>
          </div>
        </div>

        {/* ── Filter Bar ───────────────────────────────────────── */}
        <div className="rounded-xl border border-gray-100 bg-white/80 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                <FaSearch className="mr-1 inline-block text-gray-400" />
                Tìm kiếm nhân viên
              </label>
              <Input.Search
                placeholder="Mã hoặc tên nhân viên..."
                allowClear
                className="!rounded-lg"
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
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────────── */}
        <Table<EmployeeType> {...tableProps} />
      </div>
    </ComponentCard>
  );
}
