import React from 'react';
import { Table, TableColumnsType, TableProps } from 'antd';

import { CategoryTableType } from '@/types/salaryType';

interface CategoryTableProps {
  data: CategoryTableType[];
  loading?: boolean;
}

const CategoryTable: React.FC<CategoryTableProps> = ({ data, loading }) => {
  const columns: TableColumnsType<CategoryTableType> = [
    {
      title: <div className="capitalize">STT</div>,
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      render: (_value, _record, index) => index + 1
    },
    {
      title: (
        <div className="capitalize">
          Mã
          <br />
          Nhân viên
        </div>
      ),
      minWidth: 100,
      dataIndex: 'employee_id',
      align: 'center',
      render: (_value, record) => {
        return record.employee_id || '-';
      }
    },
    {
      title: <div className="capitalize">Họ và tên</div>,
      minWidth: 200,
      dataIndex: 'employee_name',
      render: (_value, record) => {
        return record.employee?.name || '-';
      }
    },
    {
      title: <div className="capitalize">Bộ phận</div>,
      minWidth: 200,
      dataIndex: 'role_name',
      render: (_value, record) => {
        return record.employee?.role?.role_name || '-';
      }
    },
    {
      title: (
        <div className="capitalize">
          Lương Ngày
          <br />
          (Áp dụng tháng đầu)
        </div>
      ),
      className: 'bg-indigo-300',
      dataIndex: 'salary_day',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: (
        <div className="capitalize">
          Lương Đêm
          <br />
          (Áp dụng tháng đầu)
        </div>
      ),
      dataIndex: 'salary_night',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: (
        <div className="capitalize">
          Thử Việc
          <br />
          Lương CB / 26 ngày
        </div>
      ),
      className: 'bg-indigo-300',
      dataIndex: 'probationary_salary_basic_26days',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: (
        <div className="capitalize">
          Thử Việc
          <br />
          Lương CB / 1 giờ
        </div>
      ),
      dataIndex: 'probationary_salary_basic_hours',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: (
        <div className="capitalize">
          Thử Việc
          <br />
          Lương CB Tăng Ca / 1 giờ
        </div>
      ),
      className: 'bg-indigo-300',
      dataIndex: 'probationary_salary_basic_extra_hours',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Phụ cấp học việc</div>,
      dataIndex: 'allowance_apprentice',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Lương CB chính thức / 26 ngày</div>,
      className: 'bg-indigo-300',
      dataIndex: 'salary_basic',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Lương CB / giờ</div>,
      dataIndex: 'regular_salary_hour',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Lương TC / giờ </div>,
      className: 'bg-indigo-300',
      dataIndex: 'salary_overtime',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Chuyên cần</div>,
      dataIndex: 'allowance_diligence',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Trách nhiệm</div>,
      className: 'bg-indigo-300',
      dataIndex: 'allowance_responsibility',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Phụ cấp tăng ca / ngày</div>,
      dataIndex: 'allowance_overtime',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Phụ cấp đêm</div>,
      className: 'bg-indigo-300',
      dataIndex: 'allowance_night',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Phụ cấp cơm trưa</div>,
      dataIndex: 'allowance_rice',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: (
        <div className="capitalize">
          BHXH
          <br /> công ty đóng
        </div>
      ),
      className: 'bg-indigo-300',
      dataIndex: 'company_insurance',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: (
        <div className="capitalize">
          BHXH
          <br />
          người lao động đóng
        </div>
      ),
      dataIndex: 'insurance',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    }
  ];

  const tableProps: TableProps<CategoryTableType> = {
    rowKey: (record) => ['workSchedule', record.id].join('-'),
    bordered: true,
    columns: columns,
    dataSource: data,
    loading: loading,
    size: 'small',
    scroll: { x: 'max-content' },
    tableLayout: 'auto',
    pagination: false
  };

  return (
    <>
      <Table<CategoryTableType> {...tableProps} />
    </>
  );
};

export default CategoryTable;
