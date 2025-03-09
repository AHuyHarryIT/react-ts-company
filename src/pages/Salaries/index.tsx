import {
  Alert,
  Button,
  Table,
  TableColumnsType,
  TableProps,
  Tooltip,
} from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { IoReload } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';

import { SalaryType } from '@/types/salaryType';
import ComponentCard from '@components/common/ComponentCard';
import { AddSalary } from '@components/salaries/AddModal';
import { DeleteModal } from '@components/salaries/DeleteModal';
import { AppDispatch, RootState } from '@stores/index';
import { fetchSalaries, setError } from '@stores/salarySlice';
import { GoInfo } from 'react-icons/go';
import { Link } from 'react-router-dom';

export const SalaryTable = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { salaries, loading, error, totalSalaries } = useSelector(
    (state: RootState) => state.salaryTable
  );
  const { isMobile } = useSelector((state: RootState) => state.sidebar);

  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const handleReload = useCallback(() => {
    dispatch(fetchSalaries({ params: { page, limit } }));
  }, [dispatch, page, limit]);

  useEffect(() => {
    handleReload();
  }, [handleReload]);

  const columns: TableColumnsType<SalaryType> = [
    // {
    //   title: 'STT',
    //   rowScope: 'row',
    //   minWidth: 50,
    //   align: 'center',
    //   render: (_value, _record, index) => index + 1 + limit * (page - 1),
    // },
    {
      title: 'Mã',
      minWidth: 100,
      dataIndex: 'id',
    },
    {
      title: 'Tiêu đề',
      minWidth: 200,
      dataIndex: 'title',
    },
    {
      title: 'Tổng (VNĐ)',
      minWidth: 200,
      dataIndex: 'total',
      render: (value) =>
        new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(value),
    },
    {
      title: 'Ngày bắt đầu',
      minWidth: 200,
      dataIndex: 'start_date',
      render: (value) =>
        new Date(value).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
    },
    {
      title: 'Hành động',
      minWidth: 100,
      align: 'center',
      render: (_value, _record) => {
        return (
          <div className="flex gap-2">
            <Link to={`/admin/salary/detail/${_record.id}`}>
              <Button color="primary" variant="solid" icon={<GoInfo />}>
                Chi tiết
              </Button>
            </Link>
            <DeleteModal
              page={page}
              limit={limit}
              id={_record.id}
              title={_record.title}
            />
          </div>
        );
      },
    },
  ];

  const tableProps: TableProps<SalaryType> = {
    rowKey: (record) => ['salary', record.id].join('-'),
    bordered: true,
    columns: columns,
    dataSource: salaries,
    loading: loading,
    size: 'small',
    scroll: { x: 'max-content', y: 'calc(100vh - 300px)' },
    tableLayout: 'auto',
    pagination: {
      size: 'default',
      hideOnSinglePage: true,
      showSizeChanger: true,
      pageSize: limit,
      total: totalSalaries,
      showTotal: (total) => `Tổng ${total} bản lương`,
      onShowSizeChange: (_current, size) => {
        setLimit(size);
      },
      onChange: (page) => {
        setPage(page);
      },
      // TODO: wait for backend pagination
      pageSizeOptions: [],
    },
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
              onClick={handleReload}
            >
              {!isMobile && <>Làm mới</>}
            </Button>
          </Tooltip>
          <AddSalary page={page} limit={limit} />
        </div>
      </>
    );
  };

  return (
    <>
      <ComponentCard title="Danh sách bản lương">
        <Actions />
        {error && (
          <Alert
            style={{ marginBottom: 8 }}
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => dispatch(setError(null))}
          />
        )}

        <Table<SalaryType> {...tableProps} />
      </ComponentCard>
    </>
  );
};
