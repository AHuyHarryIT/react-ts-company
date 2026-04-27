import React from 'react';
import { Empty, Spin, Table, TableColumnsType, TableProps, Tag } from 'antd';

import { SalaryDetailTableType } from '@/types/salaryType';
import { useIsMobile } from '@hooks/useIsMobile';

interface SalaryDetailTableProps {
  data: SalaryDetailTableType[];
  loading?: boolean;
}

export const SalaryDetailTable: React.FC<SalaryDetailTableProps> = ({
  data,
  loading
}) => {
  const isMobile = useIsMobile();

  const formatVND = (value: number | null | undefined) => {
    if (!value) return null;
    return value.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });
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

  const columns: TableColumnsType<SalaryDetailTableType> = [
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
      title: <div className="capitalize">số công ngày</div>,
      dataIndex: 'number_of_work_days_trial',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    },
    {
      title: (
        <div className="capitalize">
          Lương ca ngày <br /> (Thử việc)
        </div>
      ),
      dataIndex: 'day_shift_salary_trial',
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
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'day_shift_salary_trial_notice'
    },
    {
      title: <div className="capitalize">Số công đêm</div>,
      dataIndex: 'number_of_work_nights_trial',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    },
    {
      title: (
        <div className="capitalize">
          Lương ca đêm <br /> (Thử việc)
        </div>
      ),
      dataIndex: 'night_shift_salary_trial',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'night_shift_salary_trial_notice',
      className: 'bg-indigo-300'
    },
    {
      title: (
        <div className="capitalize">
          Số giờ tăng ca <br /> (Thử việc)
        </div>
      ),
      dataIndex: 'overtime_hours_trial',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: (
        <div className="capitalize">
          Lương tăng ca <br /> (Thử việc)
        </div>
      ),
      dataIndex: 'overtime_salary_trial',
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
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'overtime_salary_trial_notice'
    },
    {
      title: <div className="capitalize">Số công</div>,
      dataIndex: 'number_of_work',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    },
    {
      title: <div className="capitalize">Phụ cấp học việc</div>,
      dataIndex: 'allowance_apprentice_detail',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'allowance_apprentice_detail_notice',
      className: 'bg-indigo-300'
    },
    {
      title: <div className="capitalize">Số giờ chính</div>,
      dataIndex: 'core_hours',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: <div className="capitalize">Lương chính thức</div>,
      dataIndex: 'official_salary',
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
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'official_salary_notice'
    },
    {
      title: <div className="capitalize">Chuyên cần</div>,
      dataIndex: 'number_of_hours_worked',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    },
    {
      title: <div className="capitalize">Số công làm</div>,
      dataIndex: 'number_of_work_days',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    },
    {
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'allowance_diligence_detail_notice',
      className: 'bg-indigo-300'
    },
    {
      title: <div className="capitalize">Số công làm</div>,
      dataIndex: 'number_of_jobs',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    },
    {
      title: <div className="capitalize">Trách nhiệm</div>,
      dataIndex: 'allowance_responsibility_detail',
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
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'allowance_responsibility_detail_notice'
    },
    {
      title: <div className="capitalize">Số giờ tăng ca</div>,
      dataIndex: 'overtime_hours_detail',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: <div className="capitalize">Lương tăng ca</div>,
      dataIndex: 'overtime_salary',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'overtime_salary_notice',
      className: 'bg-indigo-300'
    },
    {
      title: <div className="capitalize">Số công ngày</div>,
      dataIndex: 'number_of_work_days',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: <div className="capitalize">Phụ cấp cơm ca ngày</div>,
      dataIndex: 'allowance_rice_detail',
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
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'allowance_rice_detail_notice'
    },
    {
      title: <div className="capitalize">Số công đêm</div>,
      dataIndex: 'number_of_work_nights',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: <div className="capitalize">Phụ cấp cơm ca đêm</div>,
      dataIndex: 'allowance_shift_night',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'allowance_shift_night_notice',
      className: 'bg-indigo-300'
    },
    {
      title: <div className="capitalize">Số ngày tăng ca</div>,
      dataIndex: 'overtime_day_count_detail',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    },
    {
      title: <div className="capitalize">Phụ cấp tăng ca</div>,
      dataIndex: 'allowance_overtime_detail',
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
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'allowance_overtime_detail_notice'
    },
    {
      title: <div className="capitalize">Số ngày lễ Tết</div>,
      dataIndex: 'holidays_count_detail',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    },
    {
      title: <div className="capitalize">Tiền lễ Tết</div>,
      dataIndex: 'holidays_money',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'holidays_money_notice',
      className: 'bg-indigo-300'
    },
    {
      title: <div className="capitalize">Phép năm</div>,
      dataIndex: 'paid_holidays_count_detail',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    },
    {
      title: <div className="capitalize">Tiền phép năm</div>,
      dataIndex: 'paid_holidays_money',
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
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'paid_holidays_money_notice'
    },
    {
      title: <div className="capitalize">Số giờ công tác</div>,
      dataIndex: 'business_travel_hours',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          maximumFractionDigits: 1
        });
      }
    },
    {
      title: <div className="capitalize">Đơn giá công tác / giờ</div>,
      dataIndex: 'business_travel_unit_price_hour',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Lương đi công tác GCN</div>,
      dataIndex: 'gcn_business_travel_salary',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'gcn_business_travel_salary_notice',
      className: 'bg-indigo-300'
    },
    {
      title: <div className="capitalize">Số lần đi công tác</div>,
      dataIndex: 'number_of_business_trips',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    },
    {
      title: <div className="capitalize">Đơn giá xăng công tác / ngày</div>,
      dataIndex: 'business_fuel_unit_price_day',
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
      title: <div className="capitalize">Phụ cấp xăng đi GCN</div>,
      dataIndex: 'allowance_gcn_business_fuel',
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
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'allowance_gcn_business_fuel_notice'
    },
    {
      title: <div className="capitalize">Tiền giới thiệu người</div>,
      dataIndex: 'money_referral_people',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'money_referral_people_notice',
      className: 'bg-indigo-300'
    },
    {
      title: <div className="capitalize">Phụ cấp khác</div>,
      dataIndex: 'allowance_diffrent',
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
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'allowance_diffrent_notice'
    },
    {
      title: <div className="capitalize">Tiền thưởng đạt chuyên cần</div>,
      dataIndex: 'bonuses_for_attendance',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'bonuses_for_attendance_notice',
      className: 'bg-indigo-300'
    },
    {
      title: <div className="capitalize">Ốm đau</div>,
      dataIndex: 'sickness',
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
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'sickness_notice'
    },
    {
      title: <div className="capitalize">Ma chay</div>,
      dataIndex: 'funeral',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'funeral_notice',
      className: 'bg-indigo-300'
    },
    {
      title: <div className="capitalize">Tiền sinh nhật</div>,
      dataIndex: 'birthday_money',
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
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'birthday_money_notice'
    },
    {
      title: (
        <div className="capitalize">
          Tiền lương <br /> tháng trước bị thiếu
        </div>
      ),
      dataIndex: 'previous_period_debt',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'previous_period_debt_notice',
      className: 'bg-indigo-300'
    },
    {
      title: <div className="capitalize">Tổng thu nhập</div>,
      dataIndex: 'total_income',
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
      title: <div className="capitalize">Trừ BHXH (10.5%)</div>,
      dataIndex: 'insurance_detail',
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
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'insurance_detail_notice'
    },
    {
      title: <div className="capitalize">Tạm ứng</div>,
      dataIndex: 'advance_money',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'advance_money_notice',
      className: 'bg-indigo-300'
    },
    {
      title: <div className="capitalize">Số lần vi phạm</div>,
      dataIndex: 'number_of_violations',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    },
    {
      title: <div className="capitalize">Phí công đoàn (0.5%)</div>,
      dataIndex: 'unicon_deduction',
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
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'unicon_deduction_notice'
    },
    {
      title: <div className="capitalize">Số ngày nghỉ có phép</div>,
      dataIndex: 'daysleave_allowed',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    },
    {
      title: <div className="capitalize">Trừ tiền</div>,
      dataIndex: 'subtract_daysleave_allowed',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'subtract_daysleave_allowed_notice',
      className: 'bg-indigo-300'
    },
    {
      title: <div className="capitalize">Số ngày nghỉ không phép</div>,
      dataIndex: 'daysleave_notallowed',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    },
    {
      title: <div className="capitalize">Trừ tiền</div>,
      dataIndex: 'subtract_daysleave_notallowed',
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
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'subtract_daysleave_notallowed_notice'
    },
    {
      title: <div className="capitalize">Số lỗi nghiêm trọng</div>,
      dataIndex: 'error_serious',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    },
    {
      title: <div className="capitalize">Trừ lỗi nghiêm trọng</div>,
      dataIndex: 'subtract_error_serious',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'subtract_error_serious_notice',
      className: 'bg-indigo-300'
    },
    {
      title: <div className="capitalize">Số lỗi nhẹ</div>,
      dataIndex: 'error_minor',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN');
      }
    },
    {
      title: <div className="capitalize">Trừ lỗi nhẹ</div>,
      dataIndex: 'subtract_error_minor',
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
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'subtract_error_minor_notice'
    },
    {
      title: <div className="capitalize">Trừ KPI</div>,
      dataIndex: 'kpi_subtraction',
      align: 'center',
      className: 'bg-indigo-300',
      render: (value) => {
        if (!value) return '-';
        return value.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      }
    },
    {
      title: <div className="capitalize">Ghi chú</div>,
      dataIndex: 'kpi_subtraction_notice',
      className: 'bg-indigo-300'
    },
    {
      title: <div className="capitalize">Thực lãnh</div>,
      dataIndex: 'actually_received',
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
      title: <div className="capitalize">Hình thức thanh toán</div>,
      dataIndex: 'forms_of_payment',
      align: 'center'
    },
    {
      title: (
        <div className="capitalize">
          BHXH (21.5%) <br /> Công ty đóng cho NLĐ
        </div>
      ),
      dataIndex: 'company_insurance_detail',
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
  const tableProps: TableProps<SalaryDetailTableType> = {
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
                key={['detail', record.id, record.employee_id].join('-')}
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

                {/* Thử việc */}
                <div className="mt-2 space-y-0.5 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                  <div className="mb-1.5 text-[10px] font-semibold tracking-wider text-orange-500 uppercase">
                    Thử việc
                  </div>
                  <Field
                    label="Số công ngày"
                    value={record.number_of_work_days_trial}
                  />
                  <Field
                    label="Lương ca ngày"
                    value={formatVND(record.day_shift_salary_trial)}
                    highlight
                  />
                  <Field
                    label="Số công đêm"
                    value={record.number_of_work_nights_trial}
                  />
                  <Field
                    label="Lương ca đêm"
                    value={formatVND(record.night_shift_salary_trial)}
                    highlight
                  />
                  <Field
                    label="Số giờ TC"
                    value={record.overtime_hours_trial?.toLocaleString(
                      'vi-VN',
                      { maximumFractionDigits: 1 }
                    )}
                  />
                  <Field
                    label="Lương TC"
                    value={formatVND(record.overtime_salary_trial)}
                  />
                  <Field
                    label="PC học việc"
                    value={formatVND(record.allowance_apprentice_detail)}
                  />
                </div>

                {/* Chính thức */}
                <div className="mt-2 space-y-0.5 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                  <div className="mb-1.5 text-[10px] font-semibold tracking-wider text-blue-500 uppercase">
                    Chính thức
                  </div>
                  <Field label="Số công" value={record.number_of_work} />
                  <Field
                    label="Số giờ chính"
                    value={record.core_hours?.toLocaleString('vi-VN', {
                      maximumFractionDigits: 1
                    })}
                  />
                  <Field
                    label="Lương chính thức"
                    value={formatVND(record.official_salary)}
                    highlight
                  />
                  <Field
                    label="Số giờ TC"
                    value={record.overtime_hours_detail?.toLocaleString(
                      'vi-VN',
                      { maximumFractionDigits: 1 }
                    )}
                  />
                  <Field
                    label="Lương tăng ca"
                    value={formatVND(record.overtime_salary)}
                    highlight
                  />
                </div>

                {/* Phụ cấp */}
                <div className="mt-2 space-y-0.5 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                  <div className="mb-1.5 text-[10px] font-semibold tracking-wider text-emerald-500 uppercase">
                    Phụ cấp
                  </div>
                  <Field
                    label="Chuyên cần"
                    value={record.number_of_hours_worked}
                  />
                  <Field
                    label="Trách nhiệm"
                    value={formatVND(record.allowance_responsibility_detail)}
                  />
                  <Field
                    label="PC cơm ngày"
                    value={formatVND(record.allowance_rice_detail)}
                  />
                  <Field
                    label="PC cơm đêm"
                    value={formatVND(record.allowance_shift_night)}
                  />
                  <Field
                    label="PC tăng ca"
                    value={formatVND(record.allowance_overtime_detail)}
                  />
                  <Field
                    label="PC khác"
                    value={formatVND(record.allowance_diffrent)}
                  />
                  <Field
                    label="Tiền lễ Tết"
                    value={formatVND(record.holidays_money)}
                  />
                  <Field
                    label="Tiền phép năm"
                    value={formatVND(record.paid_holidays_money)}
                  />
                  <Field
                    label="Thưởng chuyên cần"
                    value={formatVND(record.bonuses_for_attendance)}
                  />
                  <Field
                    label="Tiền sinh nhật"
                    value={formatVND(record.birthday_money)}
                  />
                  <Field
                    label="Lương CT GCN"
                    value={formatVND(record.gcn_business_travel_salary)}
                  />
                  <Field
                    label="PC xăng GCN"
                    value={formatVND(record.allowance_gcn_business_fuel)}
                  />
                  <Field
                    label="Giới thiệu người"
                    value={formatVND(record.money_referral_people)}
                  />
                  <Field label="Ốm đau" value={formatVND(record.sickness)} />
                  <Field label="Ma chay" value={formatVND(record.funeral)} />
                  <Field
                    label="Lương tháng trước thiếu"
                    value={formatVND(record.previous_period_debt)}
                  />
                </div>

                {/* Tổng + Khấu trừ */}
                <div className="mt-2 space-y-0.5 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                  <div className="mb-1.5 text-[10px] font-semibold tracking-wider text-red-500 uppercase">
                    Khấu trừ
                  </div>
                  <Field
                    label="BHXH (10.5%)"
                    value={formatVND(record.insurance_detail)}
                    danger
                  />
                  <Field
                    label="Tạm ứng"
                    value={formatVND(record.advance_money)}
                    danger
                  />
                  <Field
                    label="Vi phạm"
                    value={record.number_of_violations?.toString()}
                    danger
                  />
                  <Field
                    label="Phí CĐ (1%)"
                    value={formatVND(record.unicon_deduction)}
                    danger
                  />
                  <Field
                    label="Nghỉ có phép"
                    value={formatVND(record.subtract_daysleave_allowed)}
                    danger
                  />
                  <Field
                    label="Nghỉ không phép"
                    value={formatVND(record.subtract_daysleave_notallowed)}
                    danger
                  />
                  <Field
                    label="Lỗi nghiêm trọng"
                    value={formatVND(record.subtract_error_serious)}
                    danger
                  />
                  <Field
                    label="Lỗi nhẹ"
                    value={formatVND(record.subtract_error_minor)}
                    danger
                  />
                  <Field
                    label="Trừ KPI"
                    value={formatVND(record.kpi_subtraction)}
                    danger
                  />
                </div>

                {/* Tổng thu nhập + Thực lãnh */}
                <div className="mt-2 flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-900/20">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                    Tổng thu nhập
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {formatVND(record.total_income) || '-'}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Thực lãnh
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatVND(record.actually_received) || '-'}
                  </span>
                </div>
                {record.forms_of_payment && (
                  <div className="mt-1 text-center text-[11px] text-gray-400">
                    {record.forms_of_payment}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Spin>
    );
  }

  return <Table<SalaryDetailTableType> {...tableProps} />;
};
