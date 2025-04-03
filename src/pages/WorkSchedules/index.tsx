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

import { WorkScheduleType } from '@/types/workScheduleType';
import ComponentCard from '@components/common/ComponentCard';
import { AddWorkSchedule } from '@components/workSchedules/AddModal';
import { DeleteModal } from '@components/workSchedules/DeleteModal';
import { AppDispatch, RootState } from '@stores/index';
import { fetchWorkSchedules, setError } from '@stores/workScheduleSlice';
import { GoInfo } from 'react-icons/go';
import { Link } from '@tanstack/react-router';

export const WorkSchedules = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    workSchedules: workSchedules,
    loading,
    error,
    totalWorkSchedules: totalWorkSchedules,
  } = useSelector((state: RootState) => state.workSchedules);
  const { isMobile } = useSelector((state: RootState) => state.sidebar);

  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchWorkSchedules({ params: { page, limit } }));
  }, [dispatch, limit, page]);

  const handleReload = useCallback(() => {
    dispatch(fetchWorkSchedules({ params: { page, limit } }));
  }, [dispatch, page, limit]);

  const columns: TableColumnsType<WorkScheduleType> = [
    {
      title: 'STT',
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      render: (_value, _record, index) => index + 1 + limit * (page - 1),
    },
    {
      title: 'Mã',
      minWidth: 75,
      dataIndex: 'id',
    },
    {
      title: 'Tên lịch làm việc',
      minWidth: 200,
      dataIndex: 'name',
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
            <Link
              to={'/admin/work-schedules/$id'}
              params={{
                id: _record.id,
              }}
            >
              <Button color="primary" variant="solid" icon={<GoInfo />}>
                Chi tiết
              </Button>
            </Link>
            <DeleteModal
              page={page}
              limit={limit}
              id={_record.id}
              name={_record.name}
            />
          </div>
        );
      },
    },
  ];

  const tableProps: TableProps<WorkScheduleType> = {
    rowKey: (record) => ['workSchedule', record.id].join('-'),
    bordered: true,
    columns: columns,
    dataSource: workSchedules,
    loading: loading,
    size: 'small',
    scroll: { x: 'max-content', y: 'calc(100vh - 300px)' },
    tableLayout: 'auto',
    pagination: {
      size: 'default',
      hideOnSinglePage: true,
      showSizeChanger: true,
      pageSize: limit,
      total: totalWorkSchedules,
      showTotal: (total) => `Tổng ${total} lịch làm việc`,
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
          <AddWorkSchedule page={page} limit={limit} />
        </div>
      </>
    );
  };

  return (
    <>
      <ComponentCard title="Danh sách lịch làm việc">
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

        <Table<WorkScheduleType> {...tableProps} />
      </ComponentCard>
    </>
  );
};
