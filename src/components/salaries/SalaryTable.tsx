import React from 'react';
import { Table, TableColumnsType, TableProps } from 'antd';

import { SalaryTableType } from '@/types/salaryType';

interface SalaryTableProps {
  data: SalaryTableType[];
  loading?: boolean;
}

export const SalaryTable: React.FC<SalaryTableProps> = ({ data, loading }) => {
  const columns: TableColumnsType<SalaryTableType> = [
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
      dataIndex: 'employee_code',
      align: 'center',
      render: (_value, record) => {
        return record.employee?.code || '-';
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
      title: <div className="capitalize">Tổng lương</div>,
      dataIndex: 'salary_total',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Trừ bảo hiểm</div>,
      dataIndex: 'insurance_payroll',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Tạm ứng</div>,
      dataIndex: 'advance_money_payroll',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">BH công ty đóng (21%)</div>,
      dataIndex: 'company_insurance_payroll',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">KPI</div>,
      dataIndex: 'KPI_Subtraction_payroll',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Nợ kỳ trước</div>,
      dataIndex: 'previous_period_debt_payroll',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Thực lãnh</div>,
      dataIndex: 'actually_received_payroll',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    }
  ];

  const tableProps: TableProps<SalaryTableType> = {
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
  return <Table<SalaryTableType> {...tableProps} />;
};
