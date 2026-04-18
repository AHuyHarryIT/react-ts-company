import { SALARY_WEB_CALCULATE_MODE } from '@/configs/environment.config';
import type {
  AllowanceSection,
  CalculatePayload,
  CompanyType,
  FeDrivenCalculatedEmployeePayload,
  FeDrivenPayrollPayload,
  SalarySummary,
  SalaryWebEmployee,
  SalaryWebFieldValue
} from '@/types/salaryWebType';

type BuildCalculatePayloadOptions = {
  company: CompanyType;
  employees?: SalaryWebEmployee[];
  employeeIds?: string[] | null;
  mode?: 'be-calculate' | 'fe-driven-map';
  includeSalaryFields?: boolean;
  includeSheetAllColumns?: boolean;
};

const toNumber = (value: unknown, fallback = 0): number => {
  const num = typeof value === 'string' ? Number(value) : (value as number);
  return Number.isFinite(num) ? num : fallback;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Object.prototype.toString.call(value) === '[object Object]';
};

const hasPrimitiveValue = (value: unknown): value is SalaryWebFieldValue => {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null
  );
};

const flattenPrimitiveFields = (
  source: unknown,
  target: Record<string, SalaryWebFieldValue>
) => {
  if (!isPlainObject(source)) return;

  Object.entries(source).forEach(([key, value]) => {
    if (hasPrimitiveValue(value)) {
      target[key] = value;
      return;
    }

    if (Array.isArray(value)) return;

    if (isPlainObject(value)) {
      flattenPrimitiveFields(value, target);
    }
  });
};

const readCalculationSummary = (
  employee: SalaryWebEmployee
): Partial<SalarySummary> => {
  if (!isPlainObject(employee.calculation_detail)) return {};
  const summary = employee.calculation_detail.summary;
  return isPlainObject(summary) ? (summary as Partial<SalarySummary>) : {};
};

const readAllowanceSection = (
  employee: SalaryWebEmployee
): Partial<AllowanceSection> => {
  if (!isPlainObject(employee.calculation_detail)) return {};
  const allowance = employee.calculation_detail.allowance_section;
  return isPlainObject(allowance)
    ? (allowance as Partial<AllowanceSection>)
    : {};
};

const buildPayrollPayload = (
  employee: SalaryWebEmployee
): FeDrivenPayrollPayload => {
  const summary = readCalculationSummary(employee);
  const allowance = readAllowanceSection(employee);
  const payroll = employee.payroll as Record<string, unknown>;

  return {
    salary_total: toNumber(
      employee.payroll?.salary_total ??
        summary.total_income ??
        payroll.salary_total
    ),
    insurance_payroll: toNumber(
      employee.payroll?.insurance_payroll ??
        summary.insurance_deduction ??
        payroll.insurance_payroll
    ),
    advance_money_payroll: toNumber(
      summary.advance_money ?? payroll.advance_money_payroll
    ),
    company_insurance_payroll: toNumber(
      summary.company_insurance ?? payroll.company_insurance_payroll
    ),
    KPI_Subtraction_payroll: toNumber(
      summary.kpi_deduction ?? payroll.KPI_Subtraction_payroll
    ),
    previous_period_debt_payroll: toNumber(
      allowance.previous_debt ?? payroll.previous_period_debt_payroll
    ),
    actually_received_payroll: toNumber(
      employee.payroll?.actually_received_payroll ??
        summary.actually_received ??
        payroll.actually_received_payroll
    )
  };
};

const hasCalculatedBlocks = (employee: SalaryWebEmployee): boolean => {
  const hasPayrollValue = Object.values(employee.payroll || {}).some(
    (value) => value !== null && value !== undefined
  );

  const detail = isPlainObject(employee.calculation_detail)
    ? employee.calculation_detail
    : null;
  const hasDetailValue =
    detail != null &&
    Object.values(detail).some((value) => {
      if (value == null) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (isPlainObject(value)) return Object.keys(value).length > 0;
      return true;
    });

  return hasPayrollValue || hasDetailValue;
};

export const buildFeDrivenCalculatedEmployee = (
  employee: SalaryWebEmployee,
  options?: {
    includeSalaryFields?: boolean;
    includeSheetAllColumns?: boolean;
  }
): FeDrivenCalculatedEmployeePayload => {
  const payroll = buildPayrollPayload(employee);
  const calculated: FeDrivenCalculatedEmployeePayload = {
    employee_id: String(employee.employee_id),
    employee_type: employee.employee_type,
    timekeeping_summary: employee.timekeeping_summary || {},
    timekeeping_daily: (employee.timekeeping_daily || []).map((item) => ({
      date: item.date,
      day_hours: toNumber(item.day_hours),
      night_hours: toNumber(item.night_hours),
      overtime_hours: toNumber(item.overtime_hours)
    })),
    calculation_detail: isPlainObject(employee.calculation_detail)
      ? employee.calculation_detail
      : {},
    payroll
  };

  if (options?.includeSalaryFields || options?.includeSheetAllColumns) {
    const flatFields: Record<string, SalaryWebFieldValue> = {};
    flattenPrimitiveFields(employee.category, flatFields);
    flattenPrimitiveFields(employee.timekeeping_summary, flatFields);
    flattenPrimitiveFields(employee.calculation_detail, flatFields);
    flattenPrimitiveFields(payroll, flatFields);

    if (options.includeSalaryFields) {
      calculated.salary_fields = { ...flatFields };
    }

    if (options.includeSheetAllColumns) {
      calculated.sheet_all_columns = { ...flatFields };
    }
  }

  return calculated;
};

export const buildCalculatePayload = (
  options: BuildCalculatePayloadOptions
): CalculatePayload => {
  const {
    company,
    employees = [],
    employeeIds = null,
    mode = SALARY_WEB_CALCULATE_MODE,
    includeSalaryFields = false,
    includeSheetAllColumns = false
  } = options;

  if (mode === 'be-calculate') {
    return {
      company,
      employee_ids: employeeIds
    };
  }

  const canUseFeDrivenMap =
    employees.length > 0 &&
    employees.every((employee) => hasCalculatedBlocks(employee));

  if (!canUseFeDrivenMap) {
    return {
      company,
      employee_ids: employeeIds
    };
  }

  return {
    company,
    employee_ids: employeeIds,
    calculated_data: employees.map((employee) =>
      buildFeDrivenCalculatedEmployee(employee, {
        includeSalaryFields,
        includeSheetAllColumns
      })
    )
  };
};
