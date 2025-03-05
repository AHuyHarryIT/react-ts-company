import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  TableColumnsType,
  TableProps,
  Tooltip,
  Button,
  Alert,
} from 'antd';
import { IoReload } from 'react-icons/io5';

import { WorkScheduleCategoryType } from '@/types/workScheduleCategoryType';
import ComponentCard from '@components/common/ComponentCard';
import { AddModal } from '@components/workScheduleCategories/AddModal';
import { DeleteModal } from '@components/workScheduleCategories/DeleteModal';
import { UpdateWorkScheduleCategory } from '@components/workScheduleCategories/UpdateModal';
import { AppDispatch, RootState } from '@stores/index';
import {
  fetchWorkScheduleCategories,
  setError,
} from '@stores/workScheduleCategorySlice';

export const WorkScheduleCategories = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    workScheduleCategories,
    loading,
    error,
    totalWorkScheduleCategories,
  } = useSelector((state: RootState) => state.workScheduleCategories);
  const { isMobile } = useSelector((state: RootState) => state.sidebar);

  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchWorkScheduleCategories({ params: { page, limit } }));
  }, [dispatch, limit, page]);

  const handleReload = useCallback(() => {
    dispatch(fetchWorkScheduleCategories({ params: { page, limit } }));
  }, [dispatch, page, limit]);

  const columns: TableColumnsType<WorkScheduleCategoryType> = [
    {
      title: 'STT',
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      render: (_value, _record, index) => index + 1 + limit * (page - 1),
    },
    {
      title: 'Tên danh mục',
      minWidth: 200,
      dataIndex: 'name',
    },
    {
      title: 'Mã danh mục',
      minWidth: 100,
      dataIndex: 'id',
    },
    {
      title: 'Ngày tạo',
      minWidth: 200,
      dataIndex: 'created_at',
      render: (value) =>
        new Date(value).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
    },
    {
      title: 'Ngày cập nhật',
      minWidth: 200,
      dataIndex: 'updated_at',
      render: (value) =>
        new Date(value).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
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
            <UpdateWorkScheduleCategory
              page={page}
              limit={limit}
              categoryId={_record.id}
              categoryName={_record.name}
            />
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

  const tableProps: TableProps<WorkScheduleCategoryType> = {
    rowKey: (record) => ['workScheduleCategory', record.id].join('-'),
    bordered: true,
    columns: columns,
    dataSource: workScheduleCategories,
    loading: loading,
    size: 'small',
    scroll: { x: 'max-content', y: 'calc(100vh - 300px)' },
    tableLayout: 'auto',
    pagination: {
      size: 'default',
      hideOnSinglePage: true,
      showSizeChanger: true,
      pageSize: limit,
      total: totalWorkScheduleCategories,
      showTotal: (total) => `Tổng ${total} danh mục`,
      onShowSizeChange: (_current, size) => {
        setLimit(size);
      },
      onChange: (page) => {
        setPage(page);
      },
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
          <AddModal page={page} limit={limit} />
        </div>
      </>
    );
  };

  return (
    <>
      <ComponentCard title="Danh mục lịch làm việc">
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

        <Table<WorkScheduleCategoryType> {...tableProps} />
      </ComponentCard>
    </>
  );
};
