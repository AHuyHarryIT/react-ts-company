import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { Route } from '@routes/_authenticated/employee/salaries/$id';
import { fetchSalaryDetail } from '@services/SalaryService';
import { useQuery } from '@tanstack/react-query';
import { convertNumberToWords } from '@utils/number2Word';
import { Alert, Spin } from 'antd';
import dayjs from 'dayjs';
import { SalaryTable, SalaryTableType } from './SalaryTable';

export const SalaryDetail = () => {
  const { id } = Route.useParams();

  const {
    data: salaryDetails,
    isLoading,
    error
  } = useQuery({
    queryKey: ['salaryDetail', id],
    queryFn: async () => {
      const response = await fetchSalaryDetail(id);
      return response;
    }
  });

  const { employee, salary_manager } = salaryDetails || {};

  const incomeData: SalaryTableType[] = [
    {
      key: 'day_shift_trial',
      description: 'Lương ca ngày (thử việc)',
      hours: salaryDetails?.number_of_work_days_trial || 0,
      amount: salaryDetails?.day_shift_salary_trial || 0,
      note: salaryDetails?.day_shift_salary_trial_notice || null
    },
    {
      key: 'night_shift_trial',
      description: 'Lương ca đêm (thử việc)',
      hours: salaryDetails?.number_of_work_nights_trial || 0,
      amount: salaryDetails?.night_shift_salary_trial || 0,
      note: salaryDetails?.night_shift_salary_trial_notice || null
    },
    {
      key: 'overtime_trial',
      description: 'Lương tăng ca (thử việc)',
      hours: salaryDetails?.overtime_hours_trial || 0,
      amount: salaryDetails?.overtime_salary_trial || 0,
      note: salaryDetails?.overtime_salary_trial_notice || null
    },
    {
      key: 'allowance_apprentice',
      description: 'Phụ cấp học việc',
      hours: salaryDetails?.number_of_work || 0,
      amount: salaryDetails?.allowance_apprentice_detail || 0,
      note: salaryDetails?.allowance_apprentice_detail_notice || null
    },
    {
      key: 'core_hours',
      description: 'Số giờ chính',
      hours: salaryDetails?.core_hours || 0,
      amount: salaryDetails?.official_salary || 0,
      note: salaryDetails?.official_salary_notice || null
    },
    {
      key: 'allowance_diligence',
      description: 'Chuyên cần',
      hours: 0,
      amount: salaryDetails?.allowance_diligence_detail || 0,
      note: salaryDetails?.allowance_diligence_detail_notice || null
    },
    {
      key: 'allowance_responsibility',
      description: 'Trách Nhiệm',
      hours: 0,
      amount: salaryDetails?.allowance_responsibility_detail || 0,
      note: salaryDetails?.allowance_responsibility_detail_notice || null
    },
    {
      key: 'overtime_detail',
      description: 'Số giờ tăng ca',
      hours: salaryDetails?.overtime_hours_detail || 0,
      amount: salaryDetails?.overtime_salary || 0,
      note: salaryDetails?.overtime_salary_notice || null
    },
    {
      key: 'allowance_rice',
      description: 'Phụ cấp cơm ca ngày',
      hours: salaryDetails?.number_of_work_days || 0,
      amount: salaryDetails?.allowance_rice_detail || 0,
      note: salaryDetails?.allowance_rice_detail_notice || null
    },
    {
      key: 'allowance_shift_night',
      description: 'Phụ cấp cơm ca đêm',
      hours: salaryDetails?.number_of_work_nights || 0,
      amount: salaryDetails?.allowance_shift_night || 0,
      note: salaryDetails?.allowance_shift_night_notice || null
    },
    {
      key: 'allowance_overtime',
      description: 'Phụ cấp tăng ca',
      hours: salaryDetails?.overtime_day_count_detail || 0,
      amount: salaryDetails?.allowance_overtime_detail || 0,
      note: salaryDetails?.allowance_overtime_detail_notice || null
    },
    {
      key: 'holidays_money',
      description: 'Tiền lễ tết',
      hours: salaryDetails?.holidays_count_detail || 0,
      amount: salaryDetails?.holidays_money || 0,
      note: salaryDetails?.holidays_money_notice || null
    },
    {
      key: 'paid_holidays_money',
      description: 'Tiền phép năm',
      hours: salaryDetails?.paid_holidays_count_detail || 0,
      amount: salaryDetails?.paid_holidays_money || 0,
      note: salaryDetails?.paid_holidays_money_notice || null
    },
    {
      key: 'gcn_business_travel_salary',
      description: 'Lương đi công tác GCN',
      hours: salaryDetails?.business_travel_hours || 0,
      amount: salaryDetails?.gcn_business_travel_salary || 0,
      note: salaryDetails?.gcn_business_travel_salary_notice || null
    },
    {
      key: 'allowance_gcn_business_fuel',
      description: 'Phụ cấp xăng đi GCN',
      hours: salaryDetails?.number_of_business_trips || 0,
      amount: salaryDetails?.allowance_gcn_business_fuel || 0,
      note: salaryDetails?.allowance_gcn_business_fuel_notice || null
    },
    {
      key: 'money_referral_people',
      description: 'Tiền giới thiệu người',
      hours: 0,
      amount: salaryDetails?.money_referral_people || 0,
      note: salaryDetails?.money_referral_people_notice || null
    },
    {
      key: 'allowance_diffrent',
      description: 'Phụ cấp khác',
      hours: 0,
      amount: salaryDetails?.allowance_diffrent || 0,
      note: salaryDetails?.allowance_diffrent_notice || null
    },
    {
      key: 'bonuses_for_attendance',
      description: 'Tiền thưởng đạt chuyên cần',
      hours: 0,
      amount: salaryDetails?.bonuses_for_attendance || 0,
      note: salaryDetails?.bonuses_for_attendance_notice || null
    },
    {
      key: 'birthday_money',
      description: 'iền sinh nhật',
      hours: 0,
      amount: salaryDetails?.birthday_money || 0,
      note: salaryDetails?.birthday_money_notice || null
    },
    {
      key: 'previous_period_debt',
      description: 'Tiền lương tháng trước bị thiếu',
      hours: 0,
      amount: salaryDetails?.previous_period_debt || 0,
      note: salaryDetails?.previous_period_debt_notice || null
    },
    {
      key: 'total_income',
      description: 'Tổng thu nhập',
      hours: 0,
      amount: salaryDetails?.total_income || 0,
      note: null
    }
  ];

  const totalReduction =
    (salaryDetails?.insurance_detail || 0) +
    (salaryDetails?.advance_money || 0) +
    (salaryDetails?.unicon_deduction || 0) +
    (salaryDetails?.subtract_daysleave_allowed || 0) +
    (salaryDetails?.subtract_daysleave_notallowed || 0) +
    (salaryDetails?.subtract_error_serious || 0) +
    (salaryDetails?.subtract_error_minor || 0) +
    (salaryDetails?.kpi_subtraction || 0);

  const deductionData: SalaryTableType[] = [
    {
      key: 'insurance_detail',
      description: 'Khấu trừ BHXH (10.5%)',
      hours: 0,
      amount: salaryDetails?.insurance_detail || 0,
      note: salaryDetails?.insurance_detail_notice || null
    },
    {
      key: 'advance_money',
      description: 'Tạm ứng',
      hours: 0,
      amount: salaryDetails?.advance_money || 0,
      note: salaryDetails?.advance_money_notice || null
    },
    {
      key: 'unicon_deduction',
      description: 'Phí công đoàn 1%',
      hours: salaryDetails?.number_of_violations || 0,
      amount: salaryDetails?.unicon_deduction || 0,
      note: salaryDetails?.unicon_deduction_notice || null
    },
    {
      key: 'subtract_daysleave_allowed',
      description: 'Nghỉ có phép',
      hours: salaryDetails?.daysleave_allowed || 0,
      amount: salaryDetails?.subtract_daysleave_allowed || 0,
      note: salaryDetails?.subtract_daysleave_allowed_notice || null
    },
    {
      key: 'subtract_daysleave_notallowed',
      description: 'Nghỉ không phép',
      hours: salaryDetails?.daysleave_notallowed || 0,
      amount: salaryDetails?.subtract_daysleave_notallowed || 0,
      note: salaryDetails?.subtract_daysleave_notallowed_notice || null
    },
    {
      key: 'subtract_error_serious',
      description: 'Lỗi nặng',
      hours: salaryDetails?.error_serious || 0,
      amount: salaryDetails?.subtract_error_serious || 0,
      note: salaryDetails?.subtract_error_serious_notice || null
    },
    {
      key: 'subtract_error_minor',
      description: 'Lỗi nhẹ',
      hours: salaryDetails?.error_minor || 0,
      amount: salaryDetails?.subtract_error_minor || 0,
      note: salaryDetails?.subtract_error_minor_notice || null
    },
    {
      key: 'kpi_subtraction',
      description: 'Trừ KPI',
      hours: 0,
      amount: salaryDetails?.kpi_subtraction || 0,
      note: salaryDetails?.kpi_subtraction_notice || null
    },
    {
      key: 'totalReduction',
      description: 'Tổng trừ',
      hours: 0,
      amount: totalReduction || 0,
      note: null
    }
  ];

  const formsOfPayment = salaryDetails?.forms_of_payment || 'Chưa có thông tin';
  const actuallyReceived = salaryDetails?.actually_received || 0;
  const companyInsuranceDetail = salaryDetails?.company_insurance_detail || 0;
  const unionDeduction = salaryDetails?.unicon_deduction || 0;
  const totalSalary =
    actuallyReceived + unionDeduction * 2 + companyInsuranceDetail;

  const otherNotes = '......';

  return (
    <>
      <BackButton to="/employee/salaries" />
      <ComponentCard title="Chi tiết bảng lương">
        {error && (
          <div>
            <Alert
              type="warning"
              showIcon
              message="Bạn không có bảng lương này hoặc bảng lương đã bị xóa"
            />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <Spin spinning={isLoading}>
            <div className="space-y-4">
              <section>
                <h1 className="text-center text-2xl font-semibold">
                  Thông tin bảng lương
                </h1>
                <p className="text-center text-sm">
                  Từ {dayjs(salary_manager?.start_date).format('DD/MM/YYYY')}{' '}
                  đến {dayjs(salary_manager?.end_date).format('DD/MM/YYYY')}
                </p>
              </section>
              <section>
                <p>
                  <strong>Tên nhân viên: </strong>
                  {employee?.name || 'Chưa có thông tin'}
                </p>
                <p>
                  <strong>Mã nhân viên: </strong>
                  {employee?.id || 'Chưa có thông tin'}
                </p>
                <p>
                  <strong>Bộ phận: </strong>
                  {employee?.role?.role_name || 'Chưa có thông tin'}
                </p>
                <p>
                  <strong>Ngày nhận lương: </strong>
                  {dayjs(salary_manager?.date_show).format('DD/MM/YYYY')}
                </p>
              </section>
              <section>
                <strong>Các khoảng lương</strong>
                <SalaryTable data={incomeData} />
              </section>

              <section>
                <strong>Các khoảng trừ</strong>
                <SalaryTable data={deductionData} />
              </section>

              <section>
                <div>
                  <strong>Thực nhận tiền lương: </strong>
                  {actuallyReceived.toLocaleString('en-US', {
                    maximumFractionDigits: 0
                  })}
                </div>
                <div>
                  <strong>Số tiền bằng chữ: </strong>
                  {convertNumberToWords(actuallyReceived)}
                </div>
                <div>
                  <strong>Hình thức thanh toán: </strong>
                  {formsOfPayment}
                </div>
              </section>
              <section>
                <div>
                  <strong>
                    Công ty phải đóng BHXH 21,5% cho người lao động:
                  </strong>{' '}
                  {companyInsuranceDetail.toLocaleString('en-US', {
                    maximumFractionDigits: 0
                  })}
                </div>
                <div>
                  <strong className="text-red-500">
                    Công ty phải đóng Kinh phí công đoàn 2% cho người lao động:
                  </strong>{' '}
                  {(unionDeduction * 2).toLocaleString('en-US', {
                    maximumFractionDigits: 0
                  })}
                </div>
                <div>
                  <strong className="text-red-500">
                    Công ty phải tổng trả chi phí lương cho 01 người lao động /
                    tháng:
                  </strong>{' '}
                  {totalSalary.toLocaleString('en-US', {
                    maximumFractionDigits: 0
                  })}
                </div>
              </section>
              <div>
                <strong>Ghi chú:</strong>
                {otherNotes}
              </div>
            </div>
          </Spin>
        </div>
        {/* Add more details about the salary here */}
      </ComponentCard>
    </>
  );
};
