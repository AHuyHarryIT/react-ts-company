import React from 'react';
import { Table, TableColumnsType, TableProps } from 'antd';

import { SalaryDetailTableType } from '@/types/salaryType';

interface SalaryDetailTableProps {
  data: SalaryDetailTableType[];
  loading?: boolean;
}

export const SalaryDetailTable: React.FC<SalaryDetailTableProps> = ({
  data,
  loading
}) => {
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
      title: <div className="capitalize">Phí công đoàn (1%)</div>,
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
    scroll: { x: 'max-content' },
    tableLayout: 'auto',
    pagination: false
  };
  return <Table<SalaryDetailTableType> {...tableProps} />;
};
