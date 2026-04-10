import React from 'react';
import { Empty, Spin, Table, TableColumnsType, TableProps, Tag } from 'antd';

import { CategoryTableType } from '@/types/salaryType';
import { useIsMobile } from '@hooks/useIsMobile';

interface CategoryTableProps {
  data: CategoryTableType[];
  loading?: boolean;
}

const formatVND = (value: number | null | undefined) => {
  if (!value) return null;
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

/** Render a label + value row inside a mobile card */
const Field = ({
  label,
  value,
  highlight
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) =>
  value ? (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className="shrink-0 text-xs text-gray-500">{label}</span>
      <span
        className={`text-right text-xs font-medium ${highlight ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-white/80'}`}
      >
        {value}
      </span>
    </div>
  ) : null;

const CategoryTable: React.FC<CategoryTableProps> = ({ data, loading }) => {
  const isMobile = useIsMobile();

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
      fixed: 'left',
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
      render: (value) => formatVND(value) || '-'
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
      render: (value) => formatVND(value) || '-'
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
      render: (value) => formatVND(value) || '-'
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
      render: (value) => formatVND(value) || '-'
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
      render: (value) => formatVND(value) || '-'
    },
    {
      title: <div className="capitalize">Phụ cấp học việc</div>,
      dataIndex: 'allowance_apprentice',
      align: 'center',
      render: (value) => formatVND(value) || '-'
    },
    {
      title: <div className="capitalize">Lương CB chính thức / 26 ngày</div>,
      className: 'bg-indigo-300',
      dataIndex: 'salary_basic',
      align: 'center',
      render: (value) => formatVND(value) || '-'
    },
    {
      title: <div className="capitalize">Lương CB / giờ</div>,
      dataIndex: 'regular_salary_hour',
      align: 'center',
      render: (value) => formatVND(value) || '-'
    },
    {
      title: <div className="capitalize">Lương TC / giờ </div>,
      className: 'bg-indigo-300',
      dataIndex: 'salary_overtime',
      align: 'center',
      render: (value) => formatVND(value) || '-'
    },
    {
      title: <div className="capitalize">Chuyên cần</div>,
      dataIndex: 'allowance_diligence',
      align: 'center',
      render: (value) => formatVND(value) || '-'
    },
    {
      title: <div className="capitalize">Trách nhiệm</div>,
      className: 'bg-indigo-300',
      dataIndex: 'allowance_responsibility',
      align: 'center',
      render: (value) => formatVND(value) || '-'
    },
    {
      title: <div className="capitalize">Phụ cấp tăng ca / ngày</div>,
      dataIndex: 'allowance_overtime',
      align: 'center',
      render: (value) => formatVND(value) || '-'
    },
    {
      title: <div className="capitalize">Phụ cấp đêm</div>,
      className: 'bg-indigo-300',
      dataIndex: 'allowance_night',
      align: 'center',
      render: (value) => formatVND(value) || '-'
    },
    {
      title: <div className="capitalize">Phụ cấp cơm trưa</div>,
      dataIndex: 'allowance_rice',
      align: 'center',
      render: (value) => formatVND(value) || '-'
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
      render: (value) => formatVND(value) || '-'
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
      render: (value) => formatVND(value) || '-'
    }
  ];

  const tableProps: TableProps<CategoryTableType> = {
    rowKey: (record) => ['workSchedule', record.id].join('-'),
    bordered: true,
    columns: columns,
    dataSource: data,
    loading: loading,
    size: 'small',
    scroll: { x: 'max-content', scrollToFirstRowOnChange: false },
    tableLayout: 'auto',
    pagination: false
  };

  if (isMobile) {
    return (
      <Spin spinning={!!loading}>
        {data.length === 0 && !loading ? (
          <Empty description="Không có dữ liệu" />
        ) : (
          <div className="flex flex-col gap-3">
            {data.map((record, index) => (
              <div
                key={['cat', record.id, record.employee_id].join('-')}
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

                {/* Salary fields grouped */}
                <div className="mt-2 space-y-0.5 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                  <div className="mb-1.5 text-[10px] font-semibold tracking-wider text-indigo-500 uppercase">
                    Lương & Thử việc
                  </div>
                  <Field
                    label="Lương ngày"
                    value={formatVND(record.salary_day)}
                    highlight
                  />
                  <Field
                    label="Lương đêm"
                    value={formatVND(record.salary_night)}
                    highlight
                  />
                  <Field
                    label="TV - CB/26 ngày"
                    value={formatVND(record.probationary_salary_basic_26days)}
                  />
                  <Field
                    label="TV - CB/giờ"
                    value={formatVND(record.probationary_salary_basic_hours)}
                  />
                  <Field
                    label="TV - TC/giờ"
                    value={formatVND(
                      record.probationary_salary_basic_extra_hours
                    )}
                  />
                  <Field
                    label="PC học việc"
                    value={formatVND(record.allowance_apprentice)}
                  />
                </div>

                <div className="mt-2 space-y-0.5 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                  <div className="mb-1.5 text-[10px] font-semibold tracking-wider text-emerald-500 uppercase">
                    Chính thức
                  </div>
                  <Field
                    label="Lương CB/26 ngày"
                    value={formatVND(record.salary_basic)}
                    highlight
                  />
                  <Field
                    label="Lương CB/giờ"
                    value={formatVND(record.regular_salary_hour)}
                  />
                  <Field
                    label="Lương TC/giờ"
                    value={formatVND(record.salary_overtime)}
                    highlight
                  />
                </div>

                <div className="mt-2 space-y-0.5 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                  <div className="mb-1.5 text-[10px] font-semibold tracking-wider text-amber-500 uppercase">
                    Phụ cấp & Bảo hiểm
                  </div>
                  <Field
                    label="Chuyên cần"
                    value={formatVND(record.allowance_diligence)}
                  />
                  <Field
                    label="Trách nhiệm"
                    value={formatVND(record.allowance_responsibility)}
                  />
                  <Field
                    label="PC tăng ca/ngày"
                    value={formatVND(record.allowance_overtime)}
                  />
                  <Field
                    label="PC đêm"
                    value={formatVND(record.allowance_night)}
                  />
                  <Field
                    label="PC cơm trưa"
                    value={formatVND(record.allowance_rice)}
                  />
                  <Field
                    label="BHXH (CT đóng)"
                    value={formatVND(record.company_insurance)}
                  />
                  <Field
                    label="BHXH (NLĐ đóng)"
                    value={formatVND(record.insurance)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Spin>
    );
  }

  return (
    <>
      <Table<CategoryTableType> {...tableProps} />
    </>
  );
};

export default CategoryTable;
