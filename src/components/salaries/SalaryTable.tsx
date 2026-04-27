import React from 'react';
import { Empty, Spin, Table, TableColumnsType, TableProps, Tag } from 'antd';

import { SalaryTableType } from '@/types/salaryType';
import { useIsMobile } from '@hooks/useIsMobile';

interface SalaryTableProps {
  data: SalaryTableType[];
  loading?: boolean;
  company?: string;
}

const formatVND = (value: number | null | undefined) => {
  if (!value) return null;
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const Field = ({
  label,
  value,
  highlight,
  danger
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  danger?: boolean;
}) =>
  value ? (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className="shrink-0 text-xs text-gray-500">{label}</span>
      <span
        className={`text-right text-xs font-medium ${
          danger
            ? 'text-red-500'
            : highlight
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-800 dark:text-white/80'
        }`}
      >
        {value}
      </span>
    </div>
  ) : null;

export const SalaryTable: React.FC<SalaryTableProps> = ({
  data,
  loading,
  company = 'all'
}) => {
  const isMobile = useIsMobile();

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
      fixed: 'left',
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
      fixed: 'left',
      render: (_value, record) => {
        return record.employee?.name || '-';
      }
    },
    {
      title: <div className="capitalize">Bộ phận</div>,
      minWidth: 200,
      dataIndex: 'role_name',
      fixed: 'left',
      render: (_value, record) => {
        return record.employee?.role?.role_name || '-';
      }
    },
    {
      title: <div className="capitalize">Tổng lương</div>,
      dataIndex: 'salary_total',
      render: (value) => formatVND(value) || '-'
    },
    {
      title: <div className="capitalize">Trừ bảo hiểm</div>,
      dataIndex: 'insurance_payroll',
      render: (value) => formatVND(value) || '-'
    },
    {
      title: <div className="capitalize">Tạm ứng</div>,
      dataIndex: 'advance_money_payroll',
      render: (value) => formatVND(value) || '-'
    },
    {
      title: <div className="capitalize">BH công ty đóng (21%)</div>,
      dataIndex: 'company_insurance_payroll',
      render: (value) => formatVND(value) || '-'
    },
    {
      title: <div className="capitalize">KPI</div>,
      dataIndex: 'KPI_Subtraction_payroll',
      render: (value) => formatVND(value) || '-'
    },
    {
      title: <div className="capitalize">Nợ kỳ trước</div>,
      dataIndex: 'previous_period_debt_payroll',
      render: (value) => formatVND(value) || '-'
    },
    {
      title: <div className="capitalize">Thực lãnh</div>,
      dataIndex: 'actually_received_payroll',
      render: (value) => formatVND(value) || '-'
    }
  ];

  const tableProps: TableProps<SalaryTableType> = {
    rowKey: (record) => ['workSchedule', record.id].join('-'),
    bordered: true,
    columns: columns,
    dataSource: data,
    loading: loading,
    size: 'small',
    scroll: { x: 'max-content', scrollToFirstRowOnChange: false },
    tableLayout: 'auto',
    pagination: false,
    summary: () => {
      if (!data || data.length === 0) return null;

      const totals = data.reduce(
        (acc, record) => {
          acc.salary_total += record.salary_total || 0;
          acc.insurance_payroll += record.insurance_payroll || 0;
          acc.advance_money_payroll += record.advance_money_payroll || 0;
          acc.company_insurance_payroll +=
            record.company_insurance_payroll || 0;
          acc.KPI_Subtraction_payroll += record.KPI_Subtraction_payroll || 0;
          acc.previous_period_debt_payroll +=
            record.previous_period_debt_payroll || 0;
          acc.actually_received_payroll +=
            record.actually_received_payroll || 0;
          return acc;
        },
        {
          salary_total: 0,
          insurance_payroll: 0,
          advance_money_payroll: 0,
          company_insurance_payroll: 0,
          KPI_Subtraction_payroll: 0,
          previous_period_debt_payroll: 0,
          actually_received_payroll: 0
        }
      );

      return (
        <Table.Summary>
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={4} align="right">
              <strong>Tổng cộng:</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={4}>
              <strong>{formatVND(totals.salary_total)}</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={5}>
              <strong>{formatVND(totals.insurance_payroll)}</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={6}>
              <strong>{formatVND(totals.advance_money_payroll)}</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={7}>
              <strong>{formatVND(totals.company_insurance_payroll)}</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={8}>
              <strong
                style={{
                  color:
                    totals.KPI_Subtraction_payroll > 0 ? '#ff4d4f' : 'inherit'
                }}
              >
                {formatVND(totals.KPI_Subtraction_payroll)}
              </strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={9}>
              <strong
                style={{
                  color:
                    totals.previous_period_debt_payroll > 0
                      ? '#ff4d4f'
                      : 'inherit'
                }}
              >
                {formatVND(totals.previous_period_debt_payroll)}
              </strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={10}>
              <strong style={{ color: '#52c41a', fontWeight: 700 }}>
                {formatVND(totals.actually_received_payroll)}
              </strong>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        </Table.Summary>
      );
    }
  };

  if (isMobile) {
    const totals = data.reduce(
      (acc, record) => {
        acc.salary_total += record.salary_total || 0;
        acc.insurance_payroll += record.insurance_payroll || 0;
        acc.advance_money_payroll += record.advance_money_payroll || 0;
        acc.company_insurance_payroll += record.company_insurance_payroll || 0;
        acc.KPI_Subtraction_payroll += record.KPI_Subtraction_payroll || 0;
        acc.previous_period_debt_payroll +=
          record.previous_period_debt_payroll || 0;
        acc.actually_received_payroll += record.actually_received_payroll || 0;
        return acc;
      },
      {
        salary_total: 0,
        insurance_payroll: 0,
        advance_money_payroll: 0,
        company_insurance_payroll: 0,
        KPI_Subtraction_payroll: 0,
        previous_period_debt_payroll: 0,
        actually_received_payroll: 0
      }
    );

    return (
      <Spin spinning={!!loading}>
        {data.length === 0 && !loading ? (
          <Empty description="Không có dữ liệu" />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {data.map((record, index) => (
                <div
                  key={['salary', record.id, record.employee_id].join('-')}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  {/* Header */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {index + 1}
                    </span>
                    <span className="text-[15px] font-semibold text-gray-800 dark:text-white/90">
                      {record.employee?.name || '-'}
                    </span>
                    <Tag
                      color="blue"
                      className="!m-0 ml-auto !font-mono !text-xs"
                    >
                      {record.employee_id}
                    </Tag>
                  </div>
                  <div className="mb-1 text-xs text-gray-400">
                    {record.employee?.role?.role_name || '-'}
                  </div>

                  {/* Payroll summary */}
                  <div className="mt-2 space-y-0.5 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                    <Field
                      label="Tổng lương"
                      value={formatVND(record.salary_total)}
                      highlight
                    />
                    <Field
                      label="Trừ bảo hiểm"
                      value={formatVND(record.insurance_payroll)}
                      danger
                    />
                    <Field
                      label="Tạm ứng"
                      value={formatVND(record.advance_money_payroll)}
                      danger
                    />
                    <Field
                      label="BH CT đóng (21%)"
                      value={formatVND(record.company_insurance_payroll)}
                    />
                    <Field
                      label="KPI"
                      value={formatVND(record.KPI_Subtraction_payroll)}
                      danger
                    />
                    <Field
                      label="Nợ kỳ trước"
                      value={formatVND(record.previous_period_debt_payroll)}
                      danger
                    />
                  </div>

                  {/* Actual salary highlight */}
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      Thực lãnh
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatVND(record.actually_received_payroll) || '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Summary */}
            {data.length > 0 && (
              <div className="mt-4 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <h4 className="mb-3 text-center text-sm font-bold text-blue-700 dark:text-blue-400">
                  TỔNG CỘNG ({company.toUpperCase()})
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Tổng lương:
                    </span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {formatVND(totals.salary_total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Tổng trừ BH:
                    </span>
                    <span className="text-xs font-bold text-red-500">
                      {formatVND(totals.insurance_payroll)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Tổng tạm ứng:
                    </span>
                    <span className="text-xs font-bold text-red-500">
                      {formatVND(totals.advance_money_payroll)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      BH CT đóng (21%):
                    </span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {formatVND(totals.company_insurance_payroll)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Tổng KPI trừ:
                    </span>
                    <span className="text-xs font-bold text-red-500">
                      {formatVND(totals.KPI_Subtraction_payroll)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Tổng nợ kỳ trước:
                    </span>
                    <span className="text-xs font-bold text-red-500">
                      {formatVND(totals.previous_period_debt_payroll)}
                    </span>
                  </div>
                  <div className="mt-2 border-t border-blue-200 pt-2 dark:border-blue-800">
                    <div className="flex justify-between">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        Tổng thực lãnh:
                      </span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {formatVND(totals.actually_received_payroll)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Spin>
    );
  }

  return <Table<SalaryTableType> {...tableProps} />;
};
