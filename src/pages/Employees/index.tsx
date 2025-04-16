import {
  Alert,
  Avatar,
  Button,
  Table,
  TableColumnsType,
  TableProps,
  Tooltip,
} from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { EmployeeType } from '@/types/employeeType';
import { DeleteModal } from '@components/employees/DeleteModal';
import { fetchEmployees } from '@stores/employeeSlice';
import { AppDispatch, RootState } from '@stores/index';

import { BiTrash } from 'react-icons/bi';
import { FaUser } from 'react-icons/fa';
import { FaFingerprint, FaPen } from 'react-icons/fa6';
import { IoReload } from 'react-icons/io5';
import { LuUserRoundPlus } from 'react-icons/lu';
import { FilterEmployee } from '@services/EmployeeService';
import { Link } from 'react-router-dom';
import ComponentCard from '@components/common/ComponentCard';

export default function Employees() {
  const dispatch = useDispatch<AppDispatch>();
  const { employees, totalEmployees, loading, error } = useSelector(
    (state: RootState) => state.employees
  );
  const { isMobile } = useSelector((state: RootState) => state.sidebar);

  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterEmployee>({
    company: '',
    role: '',
  });

  useEffect(() => {
    dispatch(fetchEmployees({ params: { page, limit, filters } }));
  }, [dispatch, limit, page, filters]);

  useMemo(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const handleReload = useCallback(() => {
    dispatch(fetchEmployees({ params: { page, limit, filters } }));
  }, [dispatch, page, limit, filters]);

  const columns: TableColumnsType<EmployeeType> = [
    {
      title: 'STT',
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      render: (_value, _record, index) => index + 1 + limit * (page - 1),
    },
    {
      title: 'Tên/Điên Thoại',
      minWidth: 200,
      dataIndex: 'name',
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <Avatar
            src={record.photo}
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
      filterSearch: true,
    },
    {
      title: 'Chức vụ',
      minWidth: 100,
      dataIndex: 'role',
      render: (value) => value.name,
      key: 'role',
      filters: [
        { text: 'Nhân viên', value: 'Nhân viên' },
        { text: 'Quản lý', value: 'Quản lý' },
      ],
    },
    {
      title: 'Công ty ',
      minWidth: 120,
      dataIndex: 'company',
      key: 'company',
      filters: [
        { text: 'A7A', value: 'A7A' },
        { text: 'Vinh Vinh Phát', value: 'Vinh Vinh Phát' },
      ],
    },
    {
      title: 'Mã nhân viên',
      minWidth: 110,
      align: 'center',
      dataIndex: 'code',
    },
    {
      title: 'Danh mục lịch làm việc',
      minWidth: 200,
      dataIndex: 'category_calender',
      render: (value) => value.name,
    },
    {
      title: 'Hành động',
      minWidth: 100,
      align: 'center',
      render: (_value, _record) => {
        return (
          <div className="flex gap-2">
            <Button
              color="primary"
              variant="solid"
              icon={<FaPen />}
              onClick={() => console.log('fix', _record.id)}
            >
              Sửa
            </Button>
            {/* <Button color="danger" variant='solid' icon={<FaTrash/>} onClick={()=> console.log('delete', _record.id)}>Xóa</Button> */}
            <DeleteModal
              name={_record.name}
              code={_record.code}
              id={_record.id}
              page={page}
              limit={limit}
            />
          </div>
        );
      },
    },
  ];

  const tableProps: TableProps<EmployeeType> = {
    rowKey: (record) => ['employee', record.id, record.code].join('-'),
    bordered: true,
    columns: columns,
    dataSource: employees,
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
      total: totalEmployees,
      showTotal: (total) => `Tổng ${total} nhân viên`,
      onShowSizeChange: (_current, size) => {
        setLimit(size);
      },
      onChange: (page) => {
        setPage(page);
        // dispatch(fetchEmployees({ params: { page, limit, filters } }));
      },
    },
    onChange: (_, filters) => {
      setFilters({
        company:
          typeof filters?.company?.[0] === 'string'
            ? filters.company[0]
            : undefined,
      });
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
            <Button
              color="gold"
              variant="solid"
              icon={<BiTrash />}
              size="large"
            >
              {!isMobile && <>Đã xóa</>}
            </Button>
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
        {error && <Alert message={error} type="error" showIcon closable />}
        <Table<EmployeeType> {...tableProps} />
      </ComponentCard>
    </>
  );
}
