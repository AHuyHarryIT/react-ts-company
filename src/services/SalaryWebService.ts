import axiosPrivate from '@/api/axiosInstance';
import type {
  SalaryConfig,
  SalaryConfigDetail,
  CreateSalaryPayload,
  CreateSalaryResponse,
  SalaryWebDataResponse,
  UpdateCategoryPayload,
  BulkCategoryPayload,
  UpdateTimekeepingPayload,
  TimekeepingUpdateResponse,
  AdjustmentsPayload,
  CalculatePayload,
  CalculateSinglePayload,
  CalculateResponse,
  PayrollSummaryResponse,
  SalaryManager
} from '@/types/salaryWebType';

const BASE = '/api/admin/salary-web';

type SalaryConfigApiResponse = {
  success?: boolean;
  message?: string;
  data: SalaryConfig;
};

// ─── 0. Configs ──────────────────────────────────────────────────────────────

/** GET /configs — All company configs */
export const fetchSalaryWebConfigs = async (): Promise<SalaryConfig[]> => {
  const res = await axiosPrivate.get(`${BASE}/configs`);
  return res as unknown as SalaryConfig[];
};

/** GET /config/{company} — Config + formulas for one company */
export const fetchSalaryWebConfig = async (
  company: string
): Promise<SalaryConfigDetail> => {
  const res = await axiosPrivate.get(`${BASE}/config/${company}`);
  return res as unknown as SalaryConfigDetail;
};

/** PUT /config/{company} — Update config */
export const updateSalaryWebConfig = async (
  company: string,
  data: Partial<SalaryConfig>
): Promise<SalaryConfig> => {
  const res = await axiosPrivate.put(`${BASE}/config/${company}`, data);
  return res as unknown as SalaryConfig;
};

// ─── 1. Create Salary Manager ────────────────────────────────────────────────

/** POST /create — Create new salary table */
export const createSalaryWeb = async (
  data: CreateSalaryPayload
): Promise<CreateSalaryResponse> => {
  const res = await axiosPrivate.post(`${BASE}/create`, data);
  return res as unknown as CreateSalaryResponse;
};

// ─── List Salary Managers ────────────────────────────────────────────────────

/** GET / — List all salary managers */
export const fetchSalaryWebList = async (): Promise<SalaryManager[]> => {
  const res = await axiosPrivate.get(BASE);
  return res as unknown as SalaryManager[];
};

// ─── 2. Get Salary Data ──────────────────────────────────────────────────────

/** GET /{id}/data?company= — Full employee data for a salary manager */
export const fetchSalaryWebData = async (
  salaryManagerId: number,
  company: string
): Promise<SalaryWebDataResponse> => {
  const res = await axiosPrivate.get(`${BASE}/${salaryManagerId}/data`, {
    params: { company }
  });
  return res as unknown as SalaryWebDataResponse;
};

// ─── 3. Category (Basic Salary) ──────────────────────────────────────────────

/** PUT /{id}/category/{empId} — Update single employee category */
export const updateCategory = async (
  salaryManagerId: number,
  employeeId: string | number,
  data: UpdateCategoryPayload
): Promise<unknown> => {
  const res = await axiosPrivate.put(
    `${BASE}/${salaryManagerId}/category/${employeeId}`,
    data
  );
  return res;
};

// ─── 7. Config ─────────────────────────────────────────────────────────────

/** GET /config/{company} */
export const getConfig = async (
  company: string
): Promise<SalaryConfigApiResponse> => {
  const res = await axiosPrivate.get(`${BASE}/config/${company}`);
  return res as SalaryConfigApiResponse;
};

/** PUT /config/{company} */
export const updateConfig = async (
  company: string,
  data: Partial<SalaryConfig>
): Promise<SalaryConfigApiResponse> => {
  const res = await axiosPrivate.put(`${BASE}/config/${company}`, data);
  return res as SalaryConfigApiResponse;
};

/** PUT /{id}/category-bulk — Bulk update categories */
export const updateCategoryBulk = async (
  salaryManagerId: number,
  data: BulkCategoryPayload
): Promise<unknown> => {
  const res = await axiosPrivate.put(
    `${BASE}/${salaryManagerId}/category-bulk`,
    data
  );
  return res;
};

// ─── 4. Timekeeping ──────────────────────────────────────────────────────────

/** PUT /{id}/timekeeping/{empId} — Update timekeeping for one employee */
export const updateTimekeeping = async (
  salaryManagerId: number,
  employeeId: string | number,
  data: UpdateTimekeepingPayload
): Promise<TimekeepingUpdateResponse> => {
  const res = await axiosPrivate.put(
    `${BASE}/${salaryManagerId}/timekeeping/${employeeId}`,
    data
  );
  return res as unknown as TimekeepingUpdateResponse;
};

/** GET /{id}/timekeeping/{empId}?company= — Get timekeeping detail */
export const fetchTimekeeping = async (
  salaryManagerId: number,
  employeeId: string | number,
  company: string
): Promise<unknown> => {
  const res = await axiosPrivate.get(
    `${BASE}/${salaryManagerId}/timekeeping/${employeeId}`,
    { params: { company } }
  );
  return res;
};

// ─── 5. Adjustments ─────────────────────────────────────────────────────────

/** PUT /{id}/adjustments/{empId} — Update adjustments */
export const updateAdjustments = async (
  salaryManagerId: number,
  employeeId: string | number,
  data: AdjustmentsPayload
): Promise<unknown> => {
  const res = await axiosPrivate.put(
    `${BASE}/${salaryManagerId}/adjustments/${employeeId}`,
    data
  );
  return res;
};

// ─── 6. Calculate ────────────────────────────────────────────────────────────

/** POST /{id}/calculate — Calculate salary for all / selected employees */
export const calculateSalary = async (
  salaryManagerId: number,
  data: CalculatePayload
): Promise<CalculateResponse> => {
  const res = await axiosPrivate.post(
    `${BASE}/${salaryManagerId}/calculate`,
    data
  );
  return res as unknown as CalculateResponse;
};

export const syncAttendanceFromSystem = async (
  salaryManagerId: number,
  company: string
): Promise<{ message: string }> => {
  const res = await axiosPrivate.post(
    `${BASE}/${salaryManagerId}/sync-attendance`,
    { company }
  );
  return res as unknown as { message: string };
};

/** POST /{id}/calculate/{empId} — Calculate for a single employee */
export const calculateSalarySingle = async (
  salaryManagerId: number,
  employeeId: string | number,
  data: CalculateSinglePayload
): Promise<unknown> => {
  const res = await axiosPrivate.post(
    `${BASE}/${salaryManagerId}/calculate/${employeeId}`,
    data
  );
  return res;
};

// ─── 7. Payroll Summary ─────────────────────────────────────────────────────

/** GET /{id}/payroll-summary?company= — Payroll payment summary */
export const fetchPayrollSummary = async (
  salaryManagerId: number,
  company: string
): Promise<PayrollSummaryResponse> => {
  const res = await axiosPrivate.get(
    `${BASE}/${salaryManagerId}/payroll-summary`,
    { params: { company } }
  );
  return res as unknown as PayrollSummaryResponse;
};

/** PUT /{id}/timekeeping-bulk — Bulk update timekeeping */
export async function updateTimekeepingBulk(
  salaryManagerId: number,
  payload: {
    company: string;
    data: Array<{
      employee_id: string | number;
      timekeeping_data: Array<{
        date: string;
        day_hours: number;
        night_hours: number;
        overtime_hours: number;
      }>;
    }>;
  }
): Promise<{ message?: string; data?: unknown }> {
  const res = await axiosPrivate.put(
    `${BASE}/${salaryManagerId}/timekeeping-bulk`,
    payload
  );
  return res as { message?: string; data?: unknown };
}
