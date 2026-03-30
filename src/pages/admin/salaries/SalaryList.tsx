import { Link } from '@tanstack/react-router';
import { Button, Table, TableColumnsType, TableProps, Tag } from 'antd';
import { useState } from 'react';
import { FaMoneyBillWave } from 'react-icons/fa';
import { GoInfo } from 'react-icons/go';

import { useCrudList } from '@/hooks/useCrudList';
import { SalaryType } from '@/types/salaryType';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { AddSalary } from '@components/salaries/AddModal';
import { salariesService } from '@services/SalaryService';

import { customTableProps } from '@components/custom/TableProps.custom';
import { ConfirmButton } from '@components/ui/CRUD/ConfirmButton';

export default function SalaryList() {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const { data, pagination, queryResult } = useCrudList({
    service: salariesService,
    queryKey: 'salaries',
    initialFilters: {
      page,
      limit
    }
  });

  const { isLoading, isFetching, refetch } = queryResult;

  const salaries = data || [];
  const total = pagination.total || 0;

  const columns: TableColumnsType<SalaryType> = [
    {
      title: 'STT',
      rowScope: 'row',
      width: 60,
      align: 'center',
      render: (_value, _record, index) => (
        <span className="font-mono text-xs text-gray-500">
          {index + 1 + limit * (page - 1)}
        </span>
      )
    },
    {
      title: 'Mã',
      dataIndex: 'id',
      hidden: true
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      render: (value) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {value || <span className="text-gray-400 italic">Chưa có</span>}
        </span>
      )
    },
    {
      title: 'Tổng (VNĐ)',
      dataIndex: 'total',
      align: 'center',
      render: (value) => (
        <span className="font-semibold text-emerald-600">
          {new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(value)}
          <span className="ml-1 text-xs text-gray-400">₫</span>
        </span>
      )
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'start_date',
      align: 'center',
      render: (value) => (
        <Tag color="blue" className="!text-xs">
          {new Date(value).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </Tag>
      )
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'end_date',
      align: 'center',
      render: (value) => (
        <Tag color="purple" className="!text-xs">
          {new Date(value).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      align: 'center',
      width: 180,
      render: (_value, _record) => {
        return (
          <div className="flex items-center justify-center gap-2">
            <Link to={`/admin/salaries/$id`} params={{ id: _record.id }}>
              <Button color="primary" variant="solid" icon={<GoInfo />}>
                Chi tiết
              </Button>
            </Link>
            <ConfirmButton
              id={_record.id}
              service={salariesService}
              content={
                <p>
                  Bạn có chắc chắn muốn xóa bản lương{' '}
                  <strong>
                    {_record.title} - {_record.id}
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

  const tableProps: TableProps<SalaryType> = {
    ...(customTableProps as unknown as TableProps<SalaryType>),
    rowKey: (record) => ['salary', record.id].join('-'),
    columns: columns,
    dataSource: salaries,
    loading: isLoading,
    pagination: {
      ...customTableProps.pagination,
      pageSize: limit,
      total: total,
      showTotal: (total) => `Tổng ${total} bản lương`,
      onShowSizeChange: (_current, size) => {
        setLimit(size);
      },
      onChange: (page) => {
        setPage(page);
      }
    }
  };

  return (
    <ComponentCard title="Quản lý bảng lương">
      <div className="space-y-5">
        {/* ── Action Bar ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">
          <RefreshButton refresh={refetch} isLoading={isFetching} />
          <AddSalary />
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 dark:border-gray-600 dark:bg-gray-800">
            <FaMoneyBillWave className="text-xs text-emerald-500" />
            <span className="text-xs text-gray-500">
              Tổng: <strong className="text-blue-600">{total}</strong> bản lương
            </span>
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────────── */}
        <Table<SalaryType> {...tableProps} />
      </div>
    </ComponentCard>
  );
}
