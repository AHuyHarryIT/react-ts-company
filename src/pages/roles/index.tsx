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

import { RoleType } from '@/types/roleType';
import ComponentCard from '@components/common/ComponentCard';
import { AddRole } from '@components/roles/AddModal';
import { DeleteModal } from '@components/roles/DeleteModal';
import { UpdateRole } from '@components/roles/UpdateModal';
import { AppDispatch, RootState } from '@stores/index';
import { fetchRoles, setError } from '@stores/roleSlice';

export const Roles = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { roles, loading, error, totalRoles } = useSelector(
    (state: RootState) => state.roles
  );
  const { isMobile } = useSelector((state: RootState) => state.sidebar);

  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchRoles({ params: { page, limit } }));
  }, [dispatch, limit, page]);

  const handleReload = useCallback(() => {
    dispatch(fetchRoles({ params: { page, limit } }));
  }, [dispatch, page, limit]);

  const columns: TableColumnsType<RoleType> = [
    {
      title: 'STT',
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      render: (_value, _record, index) => index + 1 + limit * (page - 1),
    },
    {
      title: 'Tên chức vụ',
      minWidth: 200,
      dataIndex: 'name',
    },
    {
      title: 'Mã chức vụ',
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
            <UpdateRole
              page={page}
              limit={limit}
              roleId={_record.id}
              roleName={_record.name}
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

  const tableProps: TableProps<RoleType> = {
    rowKey: (record) => ['role', record.id].join('-'),
    bordered: true,
    columns: columns,
    dataSource: roles,
    loading: loading,
    size: 'small',
    scroll: { x: 'max-content', y: 'calc(100vh - 300px)' },
    // style: { textWrap: 'nowrap' },
    tableLayout: 'auto',
    pagination: {
      size: 'default',
      hideOnSinglePage: true,
      showSizeChanger: true,
      pageSize: limit,
      total: totalRoles,
      showTotal: (total) => `Tổng ${total} chức vụ`,
      onShowSizeChange: (_current, size) => {
        setLimit(size);
      },
      onChange: (page) => {
        setPage(page);
        // TODO: wait for api (filter)
        // dispatch(fetchEmployees({ params: { page, limit, filters } }));
      },
      //   TODO: remove pageSizeOptions
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
          <AddRole page={page} limit={limit} />
        </div>
      </>
    );
  };

  return (
    <>
      <ComponentCard title="Danh sách chức vụ">
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

        <Table<RoleType> {...tableProps} />
      </ComponentCard>
    </>
  );
};
