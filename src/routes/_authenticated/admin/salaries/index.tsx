import { createFileRoute, Link } from '@tanstack/react-router';
import { Button, Table, TableColumnsType, TableProps } from 'antd';
import { useState } from 'react';

import { useCrudList } from '@/hooks/useCrudList';
import { SalaryType } from '@/types/salaryType';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { AddSalary } from '@components/salaries/AddModal';
import { salariesService } from '@services/SalaryService';

import { customTableProps } from '@components/custom/TableProps.custom';
import { ConfirmButton } from '@components/ui/CRUD/ConfirmButton';
import { GoInfo } from 'react-icons/go';

export const Route = createFileRoute('/_authenticated/admin/salaries/')({
  component: RouteComponent
});

function RouteComponent() {
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
      align: 'center',
      render: (_value, _record, index) => index + 1 + limit * (page - 1)
    },
    {
      title: 'Mã',
      dataIndex: 'id',
      hidden: true
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title'
    },
    {
      title: 'Tổng (VNĐ)',
      dataIndex: 'total',
      render: (value) =>
        new Intl.NumberFormat('vi-VN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value)
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'start_date',
      render: (value) =>
        new Date(value).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'end_date',
      render: (value) =>
        new Date(value).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
    },
    {
      title: 'Hành động',
      align: 'center',
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

  const Actions = () => {
    return (
      <>
        <div className="flex flex-wrap gap-4">
          <RefreshButton refresh={refetch} isLoading={isFetching} />
          <AddSalary />
        </div>
      </>
    );
  };

  return (
    <>
      <ComponentCard title="Danh sách bản lương">
        <Actions />

        <Table<SalaryType> {...tableProps} />
      </ComponentCard>
    </>
  );
}
