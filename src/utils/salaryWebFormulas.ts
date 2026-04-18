/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SALARY WEB — FE-Driven Calculation Engine
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Implements ALL formulas from "Bảng tính toán" sheet (86 columns) exactly
 * as defined in the Excel files:
 *   • Bảng lương A7A Tháng 04.xlsm
 *   • Bảng lương Vinh Vinh Phát Tháng 04.xlsm
 *
 * Both companies share the SAME formulas; only config values differ:
 *   • max_work_hours: A7A=200, VVP=152(VP)/148(CB)
 *   • Chuyên môn: A7A=manual(0), VVP=manual per employee
 *
 * The BE will receive the computed result and SAVE ONLY — no recalculation.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type {
  SalaryConfig,
  SalaryWebEmployee,
  TrialSection,
  OfficialSection,
  AllowanceSection,
  SalarySummary,
  KpiDetail,
  FeDrivenCalculatedEmployeePayload,
  FeDrivenPayrollPayload,
  TimekeepingSummary
} from '@/types/salaryWebType';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Safe number extractor — returns fallback if value isn't finite */
const n = (v: unknown, fallback = 0): number => {
  if (v == null) return fallback;
  const num = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(num) ? num : fallback;
};

/** Get max work hours based on employee type + config */
const getMaxWorkHours = (
  config: SalaryConfig,
  employeeType: string
): number => {
  const maxDays =
    employeeType === 'office'
      ? config.max_work_days_office
      : config.max_work_days_worker;
  return n(maxDays) * n(config.hours_per_day, 8);
};

// ─── Extended type helpers ────────────────────────────────────────────────────

type ExtendedTimekeeping = TimekeepingSummary & {
  workday_count_trial?: number;
  worknight_count_trial?: number;
  trial_overtime_count?: number;
  overtime_day_count_trial?: number;
};

type AnyCd = Record<string, unknown>;
type AnySection = Record<string, unknown>;

const section = (cd: AnyCd, key: string): AnySection =>
  (cd[key] as AnySection) || {};

// ─── Output Type ──────────────────────────────────────────────────────────────

export interface ComputedSalaryResult {
  trial_section: TrialSection;
  official_section: OfficialSection;
  allowance_section: AllowanceSection;
  summary: SalarySummary;
  kpi_detail: KpiDetail;
}

// ─── Main Computation ─────────────────────────────────────────────────────────

export function computeEmployeeSalary(
  employee: SalaryWebEmployee,
  config: SalaryConfig
): ComputedSalaryResult {
  const cat = employee.category || ({} as AnySection);
  const ts = (employee.timekeeping_summary || {}) as ExtendedTimekeeping;
  const cd = (employee.calculation_detail || {}) as AnyCd;

  // Previous sections (preserve manual inputs + notices)
  const prevTrial = section(cd, 'trial_section');
  const prevOfficial = section(cd, 'official_section');
  const prevAllowance = section(cd, 'allowance_section');
  const prevSummary = section(cd, 'summary');
  const prevKpi = section(cd, 'kpi_detail');

  const hourlyDivisor = n(config.hourly_divisor, 204);
  const overtimeMultiplier = n(config.overtime_multiplier, 1.5);
  const maxWorkHours = getMaxWorkHours(config, employee.employee_type);

  // ── Category-derived values ──────────────────────────────────────────────

  const salary_day = n(cat.salary_day);
  const salary_night = n(cat.salary_night);
  const salary_basic = n(cat.salary_basic);
  const allowance_apprentice = n(cat.allowance_apprentice);

  // Official hourly rates (from category or computed)
  const salary_hour =
    n(cat.regular_salary_hour) || salary_basic / hourlyDivisor;
  const salary_ot_hour =
    n(cat.salary_overtime) || salary_hour * overtimeMultiplier;

  // Probation hourly rates (computed from salary_day)
  const probation_26d = salary_day * 26;
  const probation_hour = probation_26d > 0 ? probation_26d / hourlyDivisor : 0;
  const probation_ot_hour = probation_hour * overtimeMultiplier;

  // Category allowances
  const cat_diligence = n(cat.allowance_diligence);
  const cat_responsibility = n(cat.allowance_responsibility);
  const cat_allowance_overtime = n(cat.allowance_overtime);
  const cat_allowance_night = n(cat.allowance_night);
  const cat_allowance_rice = n(cat.allowance_rice);

  // ── Timekeeping values ───────────────────────────────────────────────────

  const total_day_hours = n(ts.total_day_hours);
  const total_night_hours = n(ts.total_night_hours);
  const total_overtime_hours = n(ts.total_overtime_hours);

  const trial_day_count = n(
    ts.trial_day_count ?? (ts as unknown as AnySection).workday_count_trial
  );
  const trial_night_count = n(
    ts.trial_night_count ?? (ts as unknown as AnySection).worknight_count_trial
  );
  const trial_overtime_hours_raw = n(
    (ts as unknown as AnySection).trial_overtime_count ??
      (ts as unknown as AnySection).overtime_day_count_trial
  );

  const rice_day_count = n(ts.rice_day_count);
  const night_shift_count = n(ts.night_shift_count);
  const overtime_day_count = n(ts.overtime_day_count);

  const holidays_count = n(ts.holidays_count);
  const paid_holidays_count = n(ts.paid_holidays_count);
  const days_leave_allowed = n(ts.days_leave_allowed);
  const days_leave_not_allowed = n(ts.days_leave_not_allowed);

  // ════════════════════════════════════════════════════════════════════════
  // A. THỬ VIỆC — Excel cols 5-16
  // ════════════════════════════════════════════════════════════════════════

  // Col 5-6: Lương ca ngày (thử việc)
  const trial_day_salary = trial_day_count * salary_day;

  // Col 8-9: Lương ca đêm (thử việc)
  const trial_night_salary = trial_night_count * salary_night;

  // Col 11-12: Lương tăng ca (thử việc)
  //   Excel: ='Danh muc'!L8 * 'Bảng tính toán'!K8
  //   = probation_ot_hour * trial_overtime_hours
  const trial_overtime_salary = probation_ot_hour * trial_overtime_hours_raw;

  // Col 14-15: Phụ cấp học việc
  //   Excel: ='Danh muc'!M8/26 * 'Bảng tính toán'!N8
  const apprentice_days = trial_day_count; // Same as trial_day_count
  const apprentice_allowance =
    allowance_apprentice > 0 && apprentice_days > 0
      ? (allowance_apprentice / 26) * apprentice_days
      : 0;

  const trial_section: TrialSection = {
    trial_day_count,
    trial_day_salary,
    trial_day_salary_notice:
      (prevTrial.trial_day_salary_notice as string | null) ?? null,
    trial_night_count,
    trial_night_salary,
    trial_night_salary_notice:
      (prevTrial.trial_night_salary_notice as string | null) ?? null,
    trial_overtime_hours: trial_overtime_hours_raw,
    trial_overtime_salary,
    trial_overtime_salary_notice:
      (prevTrial.trial_overtime_salary_notice as string | null) ?? null,
    apprentice_days,
    apprentice_allowance,
    apprentice_allowance_notice:
      (prevTrial.apprentice_allowance_notice as string | null) ?? null
  };

  // ════════════════════════════════════════════════════════════════════════
  // B. CHÍNH THỨC — Excel cols 17-31
  // ════════════════════════════════════════════════════════════════════════

  // Col 17: Số giờ chính = MIN(day+night, max_work_hours)
  //   Excel: =IF((E8+F8)>=Q$5, Q$5, (E8+F8))
  const core_hours = Math.min(
    total_day_hours + total_night_hours,
    maxWorkHours
  );

  // Col 18: Lương căn bản = core_hours × salary_hour
  const official_salary = core_hours * salary_hour;

  // Col 20: Số ngày nghỉ = days_leave_allowed + days_leave_not_allowed
  const absent_days = days_leave_allowed + days_leave_not_allowed;

  // Col 21: Chuyên cần (complex IF)
  //   Excel: =IF(OR(DE>=3, DF>=2), 0,
  //            IF(OR(DE==2, DF==1), Q/2, Q))
  let diligence_allowance = cat_diligence;
  if (days_leave_allowed >= 3 || days_leave_not_allowed >= 2) {
    diligence_allowance = 0;
  } else if (days_leave_allowed === 2 || days_leave_not_allowed === 1) {
    diligence_allowance = cat_diligence / 2;
  }

  // Col 24: Chuyên môn — manual input (A7A: 0, VVP: per employee)
  //  NOTE: NOT included in total_income formula per Excel
  const specialized_allowance = n(prevOfficial.specialized_allowance);

  // Col 27: Trách nhiệm = base - (base / 26 × 6)
  //   Excel: =AB8-(AB8/26*6)  where AB8 = 'Danh muc'!S8
  //   Effectively = responsibility × 20/26 (excluding 6 Sundays)
  const responsibility_allowance =
    cat_responsibility - (cat_responsibility / 26) * 6;

  // Col 29: Số giờ tăng ca
  //   Excel: =IF(E8>Q$5, (E8-Q$5), 0) + G8
  const overtime_hours =
    Math.max(total_day_hours - maxWorkHours, 0) + total_overtime_hours;

  // Col 30: Lương tăng ca = overtime_hours × salary_ot_hour
  const overtime_salary = overtime_hours * salary_ot_hour;

  const official_section: OfficialSection = {
    core_hours,
    official_salary,
    official_salary_notice:
      (prevOfficial.official_salary_notice as string | null) ?? null,
    base_salary_notice:
      (prevOfficial.base_salary_notice as string | null) ?? null,
    salary_basic_monthly: salary_basic,
    regular_salary_hour: salary_hour,
    salary_overtime_rate: salary_ot_hour,
    absent_days,
    diligence_allowance,
    diligence_allowance_notice:
      (prevOfficial.diligence_allowance_notice as string | null) ?? null,
    specialized_allowance,
    specialized_allowance_notice:
      (prevOfficial.specialized_allowance_notice as string | null) ?? null,
    responsibility_allowance,
    responsibility_allowance_notice:
      (prevOfficial.responsibility_allowance_notice as string | null) ?? null,
    overtime_hours,
    overtime_salary,
    overtime_salary_notice:
      (prevOfficial.overtime_salary_notice as string | null) ?? null
  };

  // ════════════════════════════════════════════════════════════════════════
  // C. PHỤ CẤP TỰ TÍNH — Excel cols 32-46
  // ════════════════════════════════════════════════════════════════════════

  // Col 32-33: Phụ cấp cơm ca ngày
  const rice_allowance = rice_day_count * cat_allowance_rice;

  // Col 35-36: Phụ cấp ca đêm
  const night_allowance = night_shift_count * cat_allowance_night;

  // Col 38-39: Phụ cấp tăng ca
  const overtime_allowance = overtime_day_count * cat_allowance_overtime;

  // Col 41-42: Tiền lễ tết = holidays_count × salary_hour × 8
  const holiday_pay = holidays_count * salary_hour * 8;

  // Col 44-45: Tiền phép năm = paid_holidays_count × salary_hour × 8
  const paid_leave_pay = paid_holidays_count * salary_hour * 8;

  // ════════════════════════════════════════════════════════════════════════
  // D. CÔNG TÁC — Excel cols 47-54 (manual inputs → computed results)
  // ════════════════════════════════════════════════════════════════════════

  const travel_hours = n(prevAllowance.travel_hours);
  const travel_rate = n(prevAllowance.travel_rate);
  const travel_salary = travel_hours * travel_rate; // Col 49

  const travel_trips = n(prevAllowance.travel_trips);
  const travel_fuel_rate = n(prevAllowance.travel_fuel_rate);
  const travel_fuel = travel_trips * travel_fuel_rate; // Col 53

  // ════════════════════════════════════════════════════════════════════════
  // E. CÁC KHOẢN CỘNG — Excel cols 55-66 (all manual inputs)
  // ════════════════════════════════════════════════════════════════════════

  const referral_money = n(prevAllowance.referral_money);
  const other_allowance = n(prevAllowance.other_allowance);
  const attendance_bonus = n(prevAllowance.attendance_bonus);
  const refund_kpi_previous_month = n(prevAllowance.refund_kpi_previous_month);
  const sickness = n(prevAllowance.sickness);
  const funeral = n(prevAllowance.funeral);
  const birthday_money = n(prevAllowance.birthday_money);
  const previous_debt = n(prevAllowance.previous_debt); // Col 65 — ADDITION, not deduction

  const allowance_section: AllowanceSection = {
    rice_days: rice_day_count,
    rice_allowance,
    night_shift_count,
    night_allowance,
    overtime_day_count,
    overtime_allowance,
    overtime_allowance_notice:
      (prevAllowance.overtime_allowance_notice as string | null) ?? null,
    holiday_count: holidays_count,
    holiday_pay,
    holiday_pay_notice:
      (prevAllowance.holiday_pay_notice as string | null) ?? null,
    paid_leave_count: paid_holidays_count,
    paid_leave_pay,
    paid_leave_pay_notice:
      (prevAllowance.paid_leave_pay_notice as string | null) ?? null,
    travel_hours,
    travel_rate,
    travel_salary,
    travel_trips,
    travel_fuel_rate,
    travel_fuel,
    referral_money,
    other_allowance,
    other_allowance_notice:
      (prevAllowance.other_allowance_notice as string | null) ?? null,
    attendance_bonus,
    attendance_bonus_notice:
      (prevAllowance.attendance_bonus_notice as string | null) ?? null,
    sickness,
    funeral,
    birthday_money,
    birthday_money_notice:
      (prevAllowance.birthday_money_notice as string | null) ?? null,
    refund_kpi_previous_month,
    refund_kpi_previous_month_notice:
      (prevAllowance.refund_kpi_previous_month_notice as string | null) ?? null,
    previous_debt,
    previous_debt_notice:
      (prevAllowance.previous_debt_notice as string | null) ?? null
  };

  // ════════════════════════════════════════════════════════════════════════
  // F. TỔNG THU NHẬP — Excel col 67
  // ════════════════════════════════════════════════════════════════════════
  //
  // Excel: =F8+I8+L8+O8+R8+U8+AA8+AD8+AG8+AJ8+AM8+AP8+AS8+AW8
  //        +BA8+BC8+BE8+BG8+BI8+BK8+BM8
  //
  // NOTE: Col 24 (X8 = Chuyên môn) is NOT in the Excel total formula.
  //       This matches both A7A and VVP Excel files.

  const total_income =
    trial_day_salary + // F8  = Col 6
    trial_night_salary + // I8  = Col 9
    trial_overtime_salary + // L8  = Col 12
    apprentice_allowance + // O8  = Col 15
    official_salary + // R8  = Col 18
    diligence_allowance + // U8  = Col 21
    // X8 (Col 24 Chuyên môn) NOT included per Excel formula
    responsibility_allowance + // AA8 = Col 27
    overtime_salary + // AD8 = Col 30
    rice_allowance + // AG8 = Col 33
    night_allowance + // AJ8 = Col 36
    overtime_allowance + // AM8 = Col 39
    holiday_pay + // AP8 = Col 42
    paid_leave_pay + // AS8 = Col 45
    travel_salary + // AW8 = Col 49
    travel_fuel + // BA8 = Col 53
    referral_money + // BC8 = Col 55
    other_allowance + // BE8 = Col 57
    attendance_bonus + // BG8 = Col 59
    refund_kpi_previous_month + // BI8 = Col 61
    birthday_money + // BK8 = Col 63
    previous_debt + // BM8 = Col 65
    // Extra fields not in Excel but kept for system compatibility:
    sickness +
    funeral;

  // ════════════════════════════════════════════════════════════════════════
  // G. KHẤU TRỪ — Excel cols 68-83
  // ════════════════════════════════════════════════════════════════════════

  // Col 68: BHXH 10.5% — from category (Danh muc col X)
  const insurance_deduction = n(cat.insurance);

  // Col 70: Tạm ứng — manual input
  const advance_money = n(prevSummary.advance_money);

  // Col 72: Phí công đoàn 0.5% = salary_basic × 0.5%
  const union_fee = salary_basic * 0.005;

  // Col 74: Nghỉ có phép — from timekeeping (display only)
  // Col 76: Nghỉ không phép — from timekeeping (display only)
  // Col 78: Lỗi nặng — manual input
  const error_serious = n(prevKpi.error_serious);
  // Col 80: Lỗi nhẹ — manual input
  const error_minor = n(prevKpi.error_minor);
  // Col 82: Trừ KPI — manual input (EMPTY in Excel, no auto-formula)
  const kpi_deduction = n(prevKpi.kpi_deduction ?? prevSummary.kpi_deduction);

  // Total deductions (for display, not used in Thực lãnh formula)
  const total_deductions =
    insurance_deduction + advance_money + union_fee + kpi_deduction;

  // ════════════════════════════════════════════════════════════════════════
  // H. KẾT QUẢ — Excel cols 84-86
  // ════════════════════════════════════════════════════════════════════════

  // Col 84: Thực lãnh = FLOOR(total_income - BHXH - advance - CĐ - KPI, 1000)
  const rounding = n(config.rounding_unit, 1000);
  const actually_received =
    rounding > 0
      ? Math.floor(
          (total_income -
            insurance_deduction -
            advance_money -
            union_fee -
            kpi_deduction) /
            rounding
        ) * rounding
      : total_income -
        insurance_deduction -
        advance_money -
        union_fee -
        kpi_deduction;

  // Col 85: Hình thức thanh toán — manual
  const forms_of_payment =
    (prevSummary.forms_of_payment as string) || 'Chuyển khoản';

  // Col 86: BHXH công ty đóng (21.5%) — from category (Danh muc col W)
  const company_insurance = n(cat.company_insurance);

  const summary: SalarySummary = {
    total_income,
    insurance_deduction,
    insurance_deduction_notice:
      (prevSummary.insurance_deduction_notice as string | null) ?? null,
    advance_money,
    advance_money_notice:
      (prevSummary.advance_money_notice as string | null) ?? null,
    union_fee,
    union_fee_notice: (prevSummary.union_fee_notice as string | null) ?? null,
    kpi_deduction,
    kpi_deduction_notice:
      (prevSummary.kpi_deduction_notice as string | null) ?? null,
    total_deductions,
    actually_received,
    company_insurance,
    forms_of_payment
  };

  const kpi_detail: KpiDetail = {
    days_leave_allowed,
    days_leave_allowed_notice:
      (prevKpi.days_leave_allowed_notice as string | null) ?? null,
    days_leave_not_allowed,
    days_leave_not_allowed_notice:
      (prevKpi.days_leave_not_allowed_notice as string | null) ?? null,
    error_serious,
    error_serious_notice:
      (prevKpi.error_serious_notice as string | null) ?? null,
    error_minor,
    error_minor_notice: (prevKpi.error_minor_notice as string | null) ?? null,
    kpi_deduction
  };

  return {
    trial_section,
    official_section,
    allowance_section,
    summary,
    kpi_detail
  };
}

// ─── Build FE-Driven Payload for BE Save ──────────────────────────────────────

export function buildComputedPayload(
  employee: SalaryWebEmployee,
  config: SalaryConfig
): FeDrivenCalculatedEmployeePayload {
  const result = computeEmployeeSalary(employee, config);

  const payroll: FeDrivenPayrollPayload = {
    salary_total: result.summary.total_income,
    insurance_payroll: result.summary.insurance_deduction,
    advance_money_payroll: result.summary.advance_money,
    company_insurance_payroll: result.summary.company_insurance,
    KPI_Subtraction_payroll: result.summary.kpi_deduction,
    previous_period_debt_payroll: result.allowance_section.previous_debt ?? 0,
    actually_received_payroll: result.summary.actually_received
  };

  return {
    employee_id: String(employee.employee_id),
    employee_type: employee.employee_type,
    timekeeping_summary: employee.timekeeping_summary,
    timekeeping_daily: (employee.timekeeping_daily || []).map((d) => ({
      date: d.date,
      day_hours: n(d.day_hours),
      night_hours: n(d.night_hours),
      overtime_hours: n(d.overtime_hours)
    })),
    calculation_detail: {
      trial_section: result.trial_section,
      official_section: result.official_section,
      allowance_section: result.allowance_section,
      summary: result.summary,
      kpi_detail: result.kpi_detail
    },
    payroll
  };
}

// ─── Batch compute all employees ──────────────────────────────────────────────

export function computeAllEmployees(
  employees: SalaryWebEmployee[],
  config: SalaryConfig
): Map<number, ComputedSalaryResult> {
  const map = new Map<number, ComputedSalaryResult>();
  employees.forEach((emp) => {
    map.set(emp.id, computeEmployeeSalary(emp, config));
  });
  return map;
}
