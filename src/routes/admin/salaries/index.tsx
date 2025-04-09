import { createFileRoute } from '@tanstack/react-router';
import { Button, Table, TableColumnsType, TableProps, Tooltip } from 'antd';
import { useState } from 'react';
import { IoReload } from 'react-icons/io5';

import { SalaryType } from '@/types/salaryType';
import ComponentCard from '@components/common/ComponentCard';
import { AddSalary } from '@components/salaries/AddModal';
import { DeleteModal } from '@components/salaries/DeleteModal';
import { fetchSalaries } from '@services/SalaryService';
import { uiStore } from '@stores/uiStore';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import { GoInfo } from 'react-icons/go';

export const Route = createFileRoute('/admin/salaries/')({
  component: RouteComponent
});

function RouteComponent() {
  const { isMobile } = useStore(uiStore);

  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['fetchSalaries', page, limit],
    queryFn: () =>
      fetchSalaries({
        page: page,
        limit: limit,
        filters: {
          sort: 'start_date:desc'
        }
      })
  });

  const { salaries, total } = data || {
    salaries: [],
    total: 0
  };

  const columns: TableColumnsType<SalaryType> = [
    {
      title: 'STT',
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      render: (_value, _record, index) => index + 1 + limit * (page - 1)
    },
    {
      title: 'Mã',
      minWidth: 100,
      dataIndex: 'id',
      hidden: true
    },
    {
      title: 'Tiêu đề',
      minWidth: 200,
      dataIndex: 'title'
    },
    {
      title: 'Tổng (VNĐ)',
      minWidth: 100,
      dataIndex: 'total',
      render: (value) =>
        new Intl.NumberFormat('vi-VN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value)
    },
    {
      title: 'Ngày bắt đầu',
      minWidth: 100,
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
      minWidth: 100,
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
      minWidth: 100,
      align: 'center',
      render: (_value, _record) => {
        return (
          <div className="flex items-center justify-center gap-2">
            <Link to={`/admin/salaries/$id`} params={{ id: _record.id }}>
              <Button color="primary" variant="solid" icon={<GoInfo />}>
                Chi tiết
              </Button>
            </Link>
            <DeleteModal id={_record.id} title={_record.title} />
          </div>
        );
      }
    }
  ];

  const tableProps: TableProps<SalaryType> = {
    rowKey: (record) => ['salary', record.id].join('-'),
    bordered: true,
    columns: columns,
    dataSource: salaries,
    loading: isLoading,
    size: 'small',
    scroll: { x: 'max-content', y: 'calc(100vh - 300px)' },
    tableLayout: 'auto',
    pagination: {
      size: 'default',
      showSizeChanger: true,
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
          <Tooltip title="Làm mới">
            <Button
              color="primary"
              variant="solid"
              icon={<IoReload />}
              size="large"
              onClick={() => refetch()}
              loading={isFetching}
            >
              {!isMobile && <>Làm mới</>}
            </Button>
          </Tooltip>
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
