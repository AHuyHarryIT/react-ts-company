// ─── Salary Web API Types ────────────────────────────────────────────────────

// ── Config ───────────────────────────────────────────────────────────────────
export interface SalaryConfig {
  id: number;
  company: string;
  company_name: string;
  max_work_days_worker: number;
  max_work_days_office: number;
  standard_work_days: number;
  hours_per_day: number;
  hourly_divisor: number;
  overtime_multiplier: number;
  insurance_company_rate: number;
  insurance_employee_rate: number;
  union_fee_rate: number;
  rounding_unit: number;
}

export interface FormulaDetail {
  label: string;
  formula: string;
  excel_ref: string;
  description?: string;
}

export interface SalaryFormulas {
  category_derived: Record<string, FormulaDetail>;
  calculation_formulas: Record<string, FormulaDetail>;
}

export interface SalaryConfigDetail {
  config: SalaryConfig;
  formulas: SalaryFormulas;
}

// ── Salary Manager ───────────────────────────────────────────────────────────
export interface SalaryManager {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSalaryPayload {
  title: string;
  start_date: string;
  end_date: string;
  companies: string[];
}

export interface CreateSalaryResponse {
  message: string;
  salary_manager: SalaryManager;
  initialization: Record<
    string,
    { initialized: number; total_employees: number }
  >;
}

// ── Employee Category ────────────────────────────────────────────────────────
export interface EmployeeCategory {
  salary_day: number | null;
  salary_night: number | null;
  allowance_apprentice?: number | null;
  salary_basic: number | null;
  regular_salary_hour: number | null;
  salary_overtime: number | null;
  allowance_diligence: number | null;
  allowance_responsibility: number | null;
  allowance_overtime: number | null;
  allowance_night: number | null;
  allowance_rice: number | null;
  company_insurance: number | null;
  insurance: number | null;
  has_insurance: boolean;
}

// ── Timekeeping ──────────────────────────────────────────────────────────────
export interface TimekeepingSummary {
  total_day_hours: number;
  total_night_hours: number;
  total_overtime_hours: number;
  rice_day_count: number;
  night_shift_count: number;
  overtime_day_count: number;
  trial_day_count?: number;
  trial_night_count?: number;
  holidays_count?: number;
  paid_holidays_count?: number;
  days_leave_allowed: number;
  days_leave_not_allowed: number;
}

export interface TimekeepingDaily {
  date: string;
  day_hours: number | null;
  night_hours: number | null;
  overtime_hours: number | null;
}

// ── Employee Data (from GET /{id}/data) ──────────────────────────────────────
export interface SalaryWebEmployee {
  id: number;
  employee_id: string;
  employee_name: string;
  department: string;
  employee_type: 'office' | 'worker';

  category: EmployeeCategory;
  timekeeping_summary: TimekeepingSummary;
  timekeeping_daily: TimekeepingDaily[];
  calculation_detail: Record<string, unknown>;
  payroll: {
    salary_total: number | null;
    insurance_payroll: number | null;
    actually_received_payroll: number | null;
  };
}

export interface SalaryWebDataResponse {
  salary_manager: SalaryManager;
  company: string;
  config: SalaryConfig;
  employees: SalaryWebEmployee[];
}

// ── Category Update ──────────────────────────────────────────────────────────
export interface UpdateCategoryPayload {
  company: string;
  salary_basic?: number;
  salary_day?: number;
  salary_night?: number;
  allowance_apprentice?: number;
  allowance_diligence?: number;
  allowance_specialized?: number;
  allowance_responsibility?: number;
  allowance_overtime?: number;
  allowance_night?: number;
  allowance_rice?: number;
  has_insurance?: boolean;
  employee_type?: 'office' | 'worker';
}

export interface BulkCategoryPayload {
  company: string;
  employees: Array<{
    employee_id: string;
    [key: string]: unknown;
  }>;
}

// ── Timekeeping Update ───────────────────────────────────────────────────────
export interface TimekeepingEntry {
  date: string;
  day_hours: number;
  night_hours?: number;
  overtime_hours?: number;
}

export interface UpdateTimekeepingPayload {
  company: string;
  timekeeping_data: TimekeepingEntry[];
}

export interface TimekeepingUpdateResponse {
  message: string;
  data: {
    employee_id: string;
    updated: number;
    summary: TimekeepingSummary;
  };
}

// ── Adjustments ──────────────────────────────────────────────────────────────
export interface AdjustmentsPayload {
  company: string;
  holidays_count?: number;
  paid_holidays_count?: number;
  daysleave_allowed_timekeeping?: number;
  daysleave_notallowed_timekeeping?: number;
  advance_money?: number;
  error_serious?: number;
  error_minor?: number;
  business_travel_hours?: number;
  business_travel_unit_price_hour?: number;
  number_of_business_trips?: number;
  business_fuel_unit_price_day?: number;
  money_referral_people?: number;
  allowance_diffrent?: number;
  bonuses_for_attendance?: number;
  birthday_money?: number;
  refund_kpi_previous_month?: number;
  previous_period_debt?: number;
  forms_of_payment?: string;
  // Notes / Notices
  official_salary_notice?: string | null;
  overtime_salary_notice?: string | null;
  allowance_diligence_detail_notice?: string | null;
  allowance_responsibility_detail_notice?: string | null;
  allowance_overtime_detail_notice?: string | null;
  paid_holidays_money_notice?: string | null;
  holidays_money_notice?: string | null;
  allowance_diffrent_notice?: string | null;
  advance_money_notice?: string | null;
  unicon_deduction_notice?: string | null;
  kpi_subtraction_notice?: string | null;
  refund_kpi_previous_month_notice?: string | null;
  previous_period_debt_notice?: string | null;
  bonuses_for_attendance_notice?: string | null;
  subtract_error_serious_notice?: string | null;
  subtract_error_minor_notice?: string | null;
  sickness_notice?: string | null;
  funeral_notice?: string | null;
  birthday_money_notice?: string | null;
  money_referral_people_notice?: string | null;
  insurance_deduction_notice?: string | null;
  days_leave_allowed_notice?: string | null;
  days_leave_not_allowed_notice?: string | null;
  base_salary_notice?: string | null;
  specialized_allowance_notice?: string | null;
}

// ── Calculation ──────────────────────────────────────────────────────────────
export type SalaryWebFieldValue = string | number | boolean | null;

export type SalaryWebFlatFields = Record<string, SalaryWebFieldValue>;

export interface FeDrivenPayrollPayload {
  salary_total: number;
  insurance_payroll: number;
  advance_money_payroll: number;
  company_insurance_payroll: number;
  KPI_Subtraction_payroll: number;
  previous_period_debt_payroll: number;
  actually_received_payroll: number;
}

export interface FeDrivenCalculatedEmployeePayload {
  employee_id: string;
  employee_type?: 'office' | 'worker' | string;
  timekeeping_summary?: Partial<TimekeepingSummary>;
  timekeeping_daily?: TimekeepingDaily[];
  calculation_detail?: Record<string, unknown>;
  payroll?: Partial<FeDrivenPayrollPayload>;
  salary_fields?: SalaryWebFlatFields;
  sheet_all_columns?: SalaryWebFlatFields;
}

export interface CalculatePayloadBeCalculate {
  company: string;
  employee_ids?: string[] | null;
}

export interface CalculatePayloadFeDrivenMap {
  company: string;
  employee_ids?: string[] | null;
  calculated_data: FeDrivenCalculatedEmployeePayload[];
}

export type CalculatePayload =
  | CalculatePayloadBeCalculate
  | CalculatePayloadFeDrivenMap;

export interface CalculateSinglePayloadBeCalculate {
  company: string;
  employee_type: string;
}

export interface CalculateSinglePayloadFeDrivenMap {
  company: string;
  employee_type?: string;
  timekeeping_summary?: Partial<TimekeepingSummary>;
  timekeeping_daily?: TimekeepingDaily[];
  calculation_detail?: Record<string, unknown>;
  payroll?: Partial<FeDrivenPayrollPayload>;
  salary_fields?: SalaryWebFlatFields;
  sheet_all_columns?: SalaryWebFlatFields;
}

export type CalculateSinglePayload =
  | CalculateSinglePayloadBeCalculate
  | CalculateSinglePayloadFeDrivenMap;

export interface TrialSection {
  trial_day_count: number;
  trial_day_salary: number;
  trial_day_salary_notice?: string | null;
  trial_night_count: number;
  trial_night_salary: number;
  trial_night_salary_notice?: string | null;
  trial_overtime_hours: number;
  trial_overtime_salary: number;
  trial_overtime_salary_notice?: string | null;
  apprentice_days: number;
  apprentice_allowance: number;
  apprentice_allowance_notice?: string | null;
}

export interface OfficialSection {
  core_hours: number;
  official_salary: number;
  official_salary_notice?: string | null;
  base_salary_notice?: string | null;
  salary_basic_monthly: number;
  regular_salary_hour: number;
  salary_overtime_rate: number;
  absent_days: number;
  diligence_allowance: number;
  diligence_allowance_notice?: string | null;
  specialized_allowance?: number;
  specialized_allowance_notice?: string | null;
  responsibility_allowance: number;
  responsibility_allowance_notice?: string | null;
  overtime_hours: number;
  overtime_salary: number;
  overtime_salary_notice?: string | null;
}

export interface AllowanceSection {
  rice_days: number;
  rice_allowance: number;
  night_shift_count: number;
  night_allowance: number;
  overtime_day_count: number;
  overtime_allowance: number;
  overtime_allowance_notice?: string | null;
  holiday_count: number;
  holiday_pay: number;
  holiday_pay_notice?: string | null;
  paid_leave_count: number;
  paid_leave_pay: number;
  paid_leave_pay_notice?: string | null;
  travel_hours?: number;
  travel_rate?: number;
  travel_salary?: number;
  travel_trips?: number;
  travel_fuel_rate?: number;
  travel_fuel?: number;
  referral_money?: number;
  other_allowance?: number;
  other_allowance_notice?: string | null;
  attendance_bonus?: number;
  attendance_bonus_notice?: string | null;
  sickness?: number;
  funeral?: number;
  birthday_money?: number;
  birthday_money_notice?: string | null;
  refund_kpi_previous_month?: number;
  refund_kpi_previous_month_notice?: string | null;
  previous_debt?: number;
  previous_debt_notice?: string | null;
}

export interface SalarySummary {
  total_income: number;
  insurance_deduction: number;
  insurance_deduction_notice?: string | null;
  advance_money: number;
  advance_money_notice?: string | null;
  union_fee: number;
  union_fee_notice?: string | null;
  kpi_deduction: number;
  kpi_deduction_notice?: string | null;
  total_deductions: number;
  actually_received: number;
  company_insurance: number;
  forms_of_payment: string;
}

export interface KpiDetail {
  days_leave_allowed: number;
  days_leave_allowed_notice?: string | null;
  days_leave_not_allowed: number;
  days_leave_not_allowed_notice?: string | null;
  error_serious: number;
  error_serious_notice?: string | null;
  error_minor: number;
  error_minor_notice?: string | null;
  kpi_deduction: number;
}

export interface CalculationResult {
  employee_id: string;
  employee_name: string;
  department: string;
  trial_section: TrialSection;
  official_section: OfficialSection;
  allowance_section: AllowanceSection;
  summary: SalarySummary;
  kpi_detail: KpiDetail;
}

export interface GrandTotal {
  total_income: number;
  total_deductions: number;
  total_net_pay: number;
  total_company_insurance: number;
  count: number;
}

export interface CalculateResponse {
  message: string;
  data: {
    results: CalculationResult[];
    grand_total: GrandTotal;
  };
}

// ── Payroll Summary ──────────────────────────────────────────────────────────
export interface PayrollEntry {
  employee_id: string;
  employee_name: string;
  department?: string;
  total_income: number;
  insurance_deduction: number;
  union_fee: number;
  advance_money: number;
  kpi_deduction: number;
  previous_debt?: number;
  actually_received: number;
  company_insurance: number;
}

export interface PayrollTotals {
  transfer_count: number;
  transfer_total: number;
  cash_count: number;
  cash_total: number;
  grand_total: number;
}

export interface PayrollSummaryResponse {
  salary_manager: SalaryManager;
  company: string;
  transfer_payments: PayrollEntry[];
  cash_payments: PayrollEntry[];
  totals: PayrollTotals;
}

// ── Utility Types ────────────────────────────────────────────────────────────
export type CompanyType = 'a7a' | 'vvp';
