import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableColumnsType,
  Tag,
  Statistic,
  Card,
  message,
  Input,
  InputNumber,
  Tooltip
} from 'antd';
import { useState, useMemo } from 'react';
import {
  FaCalculator,
  FaChartLine,
  FaUsers,
  FaMoneyBillWave,
  FaEdit,
  FaLock
} from 'react-icons/fa';

import {
  fetchSalaryWebData,
  updateAdjustments,
  calculateSalary
} from '@services/SalaryWebService';
import type {
  CompanyType,
  SalaryWebEmployee,
  AdjustmentsPayload,
  TrialSection,
  OfficialSection,
  AllowanceSection,
  SalarySummary,
  KpiDetail
} from '@/types/salaryWebType';
import {
  computeAllEmployees,
  type ComputedSalaryResult
} from '@/utils/salaryWebFormulas';

interface Props {
  salaryManagerId: number;
  company: CompanyType;
}

const fmtVND = (v: number | null | undefined) => {
  if (v == null || v === 0) return '—';
  return new Intl.NumberFormat('vi-VN').format(Math.round(v));
};

const fmtNumFull = (v: number | null | undefined) => {
  if (v == null || v === 0) return '—';
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(v);
};

// ─── Ô chỉ hiển thị (không chỉnh sửa) ────────────────────────────────────────
const ReadCell = ({
  value,
  isMoney = false,
  color = 'text-gray-700'
}: {
  value: number | null | undefined;
  isMoney?: boolean;
  color?: string;
}) => (
  <span
    className={`font-mono text-xs ${value ? color + ' font-medium' : 'text-gray-300'}`}
  >
    {isMoney ? fmtVND(value) : fmtNumFull(value)}
  </span>
);

// ─── Ô chỉnh sửa số ──────────────────────────────────────────────────────────
const EditableCell = ({
  value,
  onSave,
  disabled,
  isMoney = false
}: {
  value: number | null | undefined;
  onSave: (val: number | null) => void;
  disabled: boolean;
  isMoney?: boolean;
}) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState<number | null>(value ?? null);

  const handleBlur = () => {
    setEditing(false);
    if (val !== (value ?? null)) onSave(val);
  };

  if (editing) {
    return (
      <InputNumber
        autoFocus
        size="middle"
        value={val}
        onChange={(v) => setVal(v as number)}
        onBlur={handleBlur}
        onPressEnter={handleBlur}
        formatter={
          isMoney
            ? (v) => (v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '')
            : undefined
        }
        parser={
          isMoney
            ? (v) => (v ? Number(v.replace(/\./g, '')) || 0 : 0)
            : undefined
        }
        className="!w-full font-mono text-sm [&_input]:text-center"
        controls={false}
        style={{ minWidth: 80 }}
      />
    );
  }
  return (
    <div
      onClick={() => {
        if (!disabled) {
          setEditing(true);
          setVal(value ?? null);
        }
      }}
      className={`-mx-1 flex min-h-[26px] cursor-pointer items-center justify-center rounded px-1 py-0.5 text-center font-mono text-xs transition-all ${disabled ? 'cursor-not-allowed opacity-40' : 'border border-dashed border-transparent hover:border-amber-300 hover:bg-amber-50'}`}
      title={disabled ? 'Đang cập nhật...' : 'Nhấn để sửa'}
    >
      <span
        className={
          value != null && value !== 0
            ? 'font-semibold text-amber-700'
            : 'text-xs text-gray-300'
        }
      >
        {isMoney
          ? value
            ? fmtVND(value)
            : '—'
          : value
            ? fmtNumFull(value)
            : '—'}
      </span>
    </div>
  );
};

// ─── Ô chỉnh sửa ghi chú ─────────────────────────────────────────────────────
const EditableNote = ({
  value,
  onSave,
  disabled
}: {
  value: string | null | undefined;
  onSave: (val: string) => void;
  disabled: boolean;
}) => {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(value || '');

  if (editing) {
    return (
      <Input
        autoFocus
        size="small"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (note !== (value || '')) onSave(note);
        }}
        onPressEnter={() => {
          setEditing(false);
          if (note !== (value || '')) onSave(note);
        }}
        className="w-full bg-yellow-50 px-2 py-0.5 text-center text-xs"
        placeholder="Ghi chú..."
        disabled={disabled}
      />
    );
  }
  return (
    <div
      onClick={() => {
        if (!disabled) setEditing(true);
      }}
      className={`mt-0.5 flex min-h-[18px] cursor-pointer items-center justify-center text-center text-[11px] italic ${disabled ? 'cursor-not-allowed opacity-40' : 'hover:text-blue-600'}`}
      title={disabled ? 'Đang cập nhật...' : 'Nhấn để sửa ghi chú'}
    >
      {value ? (
        <span className="inline-block max-w-[110px] truncate rounded border border-yellow-300 bg-yellow-50 px-1.5 py-0.5 text-center text-[11px] text-yellow-800">
          {value}
        </span>
      ) : (
        <span className="flex items-center gap-0.5 text-gray-300 transition-colors hover:text-blue-400">
          <FaEdit size={9} /> <span className="text-[10px]">ghi chú</span>
        </span>
      )}
    </div>
  );
};

// ─── Ô chọn hình thức thanh toán ─────────────────────────────────────────────
const EditableSelect = ({
  value,
  onSave,
  disabled
}: {
  value: string | null | undefined;
  onSave: (val: string) => void;
  disabled: boolean;
}) => {
  return (
    <div
      onClick={() => {
        if (!disabled) {
          const newVal = value === 'Tiền mặt' ? 'Chuyển khoản' : 'Tiền mặt';
          onSave(newVal);
        }
      }}
      className={`-m-1 cursor-pointer rounded p-1 text-center text-[10px] font-bold transition-all select-none ${disabled ? 'cursor-not-allowed bg-gray-50 text-gray-400 opacity-50' : value === 'Tiền mặt' ? 'text-orange-600 hover:bg-orange-50 active:bg-orange-100' : 'text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100'}`}
      title={disabled ? 'Đang cập nhật...' : 'Nhấn để đổi Hình thức nhận lương'}
    >
      {value === 'Tiền mặt' ? 'Tiền mặt' : 'Chuyển khoản'}
    </div>
  );
};

// ─── Nhãn đầu cột chỉ đọc (có icon khóa) ────────────────────────────────────
const AutoCalcTitle = ({
  label,
  color = 'text-gray-600',
  iconColor = 'text-gray-400'
}: {
  label: string;
  color?: string;
  iconColor?: string;
}) => (
  <Tooltip title="Tự động tính từ công thức Excel, không chỉnh sửa">
    <div className={`flex items-center justify-center gap-1 ${color}`}>
      <FaLock size={9} className={iconColor} />
      <span className="text-xs font-bold">{label}</span>
    </div>
  </Tooltip>
);

// ─── Nhãn đầu cột có thể nhập liệu ──────────────────────────────────────────
const EditableTitle = ({
  label,
  color = 'text-amber-700',
  iconColor = 'text-amber-500'
}: {
  label: string;
  color?: string;
  iconColor?: string;
}) => (
  <div className={`flex items-center justify-center gap-1 ${color}`}>
    <FaEdit size={9} className={iconColor} />
    <span className="text-xs font-bold">{label}</span>
  </div>
);

export default function CalculationTab({ salaryManagerId, company }: Props) {
  const queryClient = useQueryClient();
  const [savingId, setSavingId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['salaryWebData', salaryManagerId, company],
    queryFn: () => fetchSalaryWebData(salaryManagerId, company),
    enabled: !!salaryManagerId
  });

  const employees = useMemo(() => data?.employees || [], [data?.employees]);
  const config = data?.config;

  // ════════════════════════════════════════════════════════════════════════
  //  FE-DRIVEN COMPUTATION — replaces BE calculateSalary
  //  Runs Excel formulas locally via useMemo whenever data changes.
  // ════════════════════════════════════════════════════════════════════════
  const computed = useMemo(() => {
    if (!config || !employees.length)
      return new Map<number, ComputedSalaryResult>();
    return computeAllEmployees(employees, config);
  }, [employees, config]);

  // ── Save mutation ─────────────────────────────────────────────────────
  //  1. Save raw adjustment to BE
  //  2. Trigger BE calculate (legacy) — when BE supports calculated_data,
  //     switch to sending FE-computed results instead
  //
  //  FE computation via useMemo above is for INSTANT display only.
  //  After refetch, useMemo auto-recomputes from latest data.
  const saveMutation = useMutation({
    mutationFn: async (payload: {
      employeeCode: string;
      data: AdjustmentsPayload;
    }) => {
      // Step 1: Save the raw adjustment
      await updateAdjustments(
        salaryManagerId,
        payload.employeeCode,
        payload.data
      );

      // Step 2: Trigger BE calculate (legacy fallback)
      // TODO: When BE implements saveCalculatedData, replace with:
      //   const freshData = await fetchSalaryWebData(salaryManagerId, company);
      //   const payloads = freshData.employees.map(e => buildComputedPayload(e, freshData.config));
      //   await calculateSalary(salaryManagerId, { company, employee_ids: null, calculated_data: payloads });
      await calculateSalary(salaryManagerId, {
        company,
        employee_ids: null
      });
    },
    onSuccess: () => {
      setSavingId(null);
      queryClient.invalidateQueries({
        queryKey: ['salaryWebData', salaryManagerId, company]
      });
      queryClient.invalidateQueries({
        queryKey: ['payrollSummary', salaryManagerId, company]
      });
    },
    onError: () => {
      setSavingId(null);
      message.error('Có lỗi khi cập nhật. Vui lòng thử lại.');
    }
  });

  const save = (
    empId: number,
    field: string,
    value: number | string | null
  ) => {
    const employeeCode = employees.find(
      (employee) => employee.id === empId
    )?.employee_id;
    if (!employeeCode) return;

    setSavingId(empId);
    saveMutation.mutate({
      employeeCode: String(employeeCode),
      data: { company, [field]: value }
    });
  };

  const isSaving = (id: number) => saveMutation.isPending && savingId === id;

  // ── Computed helpers — read from FE-computed results ───────────────────
  const trial = (r: SalaryWebEmployee): Partial<TrialSection> =>
    computed.get(r.id)?.trial_section || {};
  const official = (r: SalaryWebEmployee): Partial<OfficialSection> =>
    computed.get(r.id)?.official_section || {};
  const allowance = (r: SalaryWebEmployee): Partial<AllowanceSection> =>
    computed.get(r.id)?.allowance_section || {};
  const summary = (r: SalaryWebEmployee): Partial<SalarySummary> =>
    computed.get(r.id)?.summary || {};
  const kpi = (r: SalaryWebEmployee): Partial<KpiDetail> =>
    computed.get(r.id)?.kpi_detail || {};

  // Grand totals from FE-computed values
  const calculated = employees.filter((e) => computed.has(e.id));

  const grandTotal =
    calculated.length > 0
      ? {
          total_income: calculated.reduce(
            (s, e) => s + (computed.get(e.id)?.summary.total_income ?? 0),
            0
          ),
          total_deductions: calculated.reduce(
            (s, e) => s + (computed.get(e.id)?.summary.total_deductions ?? 0),
            0
          ),
          total_net_pay: calculated.reduce(
            (s, e) => s + (computed.get(e.id)?.summary.actually_received ?? 0),
            0
          ),
          count: calculated.length
        }
      : null;

  const columns: TableColumnsType<SalaryWebEmployee> = [
    // ── CỐ ĐỊNH TRÁI ──────────────────────────────────────────────────────────
    {
      title: 'STT',
      width: 45,
      fixed: 'left',
      align: 'center',
      className: '!bg-white',
      render: (_v, _r, i) => (
        <span className="font-mono text-sm text-gray-500">{i + 1}</span>
      )
    },
    {
      title: 'Nhân viên',
      width: 220,
      fixed: 'left',
      align: 'left',
      className: '!bg-white',
      render: (_v, r) => (
        <div className="my-0.5 ml-1 flex flex-col items-start justify-center gap-1">
          <div className="text-[13px] leading-none font-bold text-gray-800">
            {r.employee_name}
          </div>
          <div className="flex items-center gap-1.5">
            <Tag
              color="geekblue"
              className="!m-0 border border-blue-200 bg-blue-50 px-1.5 py-0 font-mono !text-[10px] font-semibold text-blue-600"
            >
              {r.employee_id}
            </Tag>
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] leading-none font-semibold whitespace-nowrap text-gray-500 uppercase">
              {r.department}
            </span>
          </div>
        </div>
      )
    },

    // ── A. THỬ VIỆC (từ trial_section) ────────────────────────────────────────
    {
      title: (
        <div className="py-1 text-center">
          <div className="text-sm font-bold text-orange-700 uppercase">
            A. Thử Việc
          </div>
          <div className="text-[10px] text-orange-400">NV chưa chính thức</div>
        </div>
      ),
      className: '!bg-orange-200',
      children: [
        {
          title: (
            <AutoCalcTitle
              label="Số công ngày (TV)"
              color="text-orange-700"
              iconColor="text-orange-400"
            />
          ),
          width: 80,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-orange-100' }),
          render: (_v, r) => <ReadCell value={trial(r).trial_day_count} />
        },
        {
          title: (
            <AutoCalcTitle
              label="Lương ca ngày (TV)"
              color="text-orange-700"
              iconColor="text-orange-400"
            />
          ),
          width: 100,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-orange-100' }),
          render: (_v, r) => (
            <ReadCell value={trial(r).trial_day_salary} isMoney />
          )
        },
        {
          title: <span className="font-semibold text-orange-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-orange-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={trial(r).trial_day_salary_notice}
              onSave={(v) => save(r.id, 'day_shift_salary_trial_notice', v)}
            />
          )
        },
        {
          title: (
            <AutoCalcTitle
              label="Số công đêm (TV)"
              color="text-orange-700"
              iconColor="text-orange-400"
            />
          ),
          width: 80,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-orange-100' }),
          render: (_v, r) => <ReadCell value={trial(r).trial_night_count} />
        },
        {
          title: (
            <AutoCalcTitle
              label="Lương ca đêm (TV)"
              color="text-orange-700"
              iconColor="text-orange-400"
            />
          ),
          width: 100,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-orange-100' }),
          render: (_v, r) => (
            <ReadCell value={trial(r).trial_night_salary} isMoney />
          )
        },
        {
          title: <span className="font-semibold text-orange-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-orange-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={trial(r).trial_night_salary_notice}
              onSave={(v) => save(r.id, 'night_shift_salary_trial_notice', v)}
            />
          )
        },
        {
          title: (
            <AutoCalcTitle
              label="Giờ tăng ca (TV)"
              color="text-orange-700"
              iconColor="text-orange-400"
            />
          ),
          width: 80,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-orange-100' }),
          render: (_v, r) => <ReadCell value={trial(r).trial_overtime_hours} />
        },
        {
          title: (
            <AutoCalcTitle
              label="Lương TC (TV)"
              color="text-orange-700"
              iconColor="text-orange-400"
            />
          ),
          width: 100,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-orange-100' }),
          render: (_v, r) => (
            <ReadCell value={trial(r).trial_overtime_salary} isMoney />
          )
        },
        {
          title: <span className="font-semibold text-orange-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-orange-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={trial(r).trial_overtime_salary_notice}
              onSave={(v) => save(r.id, 'overtime_salary_trial_notice', v)}
            />
          )
        },
        {
          title: (
            <AutoCalcTitle
              label="Phụ cấp học việc"
              color="text-orange-700"
              iconColor="text-orange-400"
            />
          ),
          width: 100,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-orange-100' }),
          render: (_v, r) => (
            <ReadCell value={trial(r).apprentice_allowance} isMoney />
          )
        },
        {
          title: <span className="font-semibold text-orange-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-orange-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={trial(r).apprentice_allowance_notice}
              onSave={(v) =>
                save(r.id, 'allowance_apprentice_detail_notice', v)
              }
            />
          )
        }
      ]
    },

    // ── B. CHÍNH THỨC (từ official_section) ──────────────────────────────────
    {
      title: (
        <div className="py-1 text-center">
          <div className="text-sm font-bold text-blue-700 uppercase">
            B. Chính Thức
          </div>
          <div className="text-[10px] text-blue-400">Lương CB / Tăng ca</div>
        </div>
      ),
      className: '!bg-blue-200',
      children: [
        {
          title: (
            <AutoCalcTitle
              label="Số giờ chính"
              color="text-blue-700"
              iconColor="text-blue-400"
            />
          ),
          width: 75,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-blue-100' }),
          render: (_v, r) => <ReadCell value={official(r).core_hours} />
        },
        {
          title: (
            <AutoCalcTitle
              label="Lương căn bản"
              color="text-blue-700"
              iconColor="text-blue-400"
            />
          ),
          width: 110,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-blue-100' }),
          render: (_v, r) => (
            <ReadCell
              value={official(r).official_salary}
              isMoney
              color="text-blue-700"
            />
          )
        },
        {
          title: <span className="font-semibold text-blue-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-blue-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={official(r).base_salary_notice}
              onSave={(v) => save(r.id, 'official_salary_notice', v)}
            />
          )
        },
        {
          title: (
            <AutoCalcTitle
              label="Số ngày nghỉ"
              color="text-blue-700"
              iconColor="text-blue-400"
            />
          ),
          width: 90,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-blue-100' }),
          render: (_v, r) => <ReadCell value={official(r).absent_days} />
        },
        {
          title: (
            <AutoCalcTitle
              label="Chuyên cần"
              color="text-blue-700"
              iconColor="text-blue-400"
            />
          ),
          width: 100,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-blue-100' }),
          render: (_v, r) => (
            <ReadCell
              value={official(r).diligence_allowance}
              isMoney
              color="text-blue-600"
            />
          )
        },
        {
          title: <span className="font-semibold text-blue-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-blue-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={official(r).diligence_allowance_notice}
              onSave={(v) => save(r.id, 'allowance_diligence_detail_notice', v)}
            />
          )
        },
        {
          title: (
            <AutoCalcTitle
              label="Số ngày nghỉ"
              color="text-blue-700"
              iconColor="text-blue-400"
            />
          ),
          width: 90,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-blue-100' }),
          render: (_v, r) => <ReadCell value={official(r).absent_days} />
        },
        {
          title: (
            <EditableTitle
              label="Chuyên môn"
              color="text-blue-700"
              iconColor="text-blue-500"
            />
          ),
          width: 100,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-blue-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              isMoney
              value={official(r).specialized_allowance}
              onSave={(v) => save(r.id, 'allowance_specialized', v)}
            />
          )
        },
        {
          title: <span className="font-semibold text-blue-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-blue-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={official(r).specialized_allowance_notice}
              onSave={(v) => save(r.id, 'specialized_allowance_notice', v)}
            />
          )
        },
        {
          title: (
            <AutoCalcTitle
              label="Số ngày nghỉ"
              color="text-blue-700"
              iconColor="text-blue-400"
            />
          ),
          width: 90,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-blue-100' }),
          render: (_v, r) => <ReadCell value={official(r).absent_days} />
        },
        {
          title: (
            <AutoCalcTitle
              label="Trách nhiệm"
              color="text-blue-700"
              iconColor="text-blue-400"
            />
          ),
          width: 100,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-blue-100' }),
          render: (_v, r) => (
            <ReadCell
              value={official(r).responsibility_allowance}
              isMoney
              color="text-blue-600"
            />
          )
        },
        {
          title: <span className="font-semibold text-blue-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-blue-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={official(r).responsibility_allowance_notice}
              onSave={(v) =>
                save(r.id, 'allowance_responsibility_detail_notice', v)
              }
            />
          )
        },
        {
          title: (
            <AutoCalcTitle
              label="Số giờ tăng ca"
              color="text-blue-700"
              iconColor="text-blue-400"
            />
          ),
          width: 80,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-blue-100' }),
          render: (_v, r) => <ReadCell value={official(r).overtime_hours} />
        },
        {
          title: (
            <AutoCalcTitle
              label="Lương tăng ca"
              color="text-blue-700"
              iconColor="text-blue-400"
            />
          ),
          width: 110,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-blue-100' }),
          render: (_v, r) => (
            <ReadCell
              value={official(r).overtime_salary}
              isMoney
              color="text-blue-700"
            />
          )
        },
        {
          title: <span className="font-semibold text-blue-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-blue-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={official(r).overtime_salary_notice}
              onSave={(v) => save(r.id, 'overtime_salary_notice', v)}
            />
          )
        }
      ]
    },

    // ── C. PHỤ CẤP TỰ TÍNH (allowance_section - auto) ────────────────────────
    {
      title: (
        <div className="py-1 text-center">
          <div className="text-sm font-bold text-emerald-700 uppercase">
            C. Phụ Cấp (Tự tính)
          </div>
          <div className="text-[10px] text-emerald-400">
            Cơm / Đêm / TC / Lễ
          </div>
        </div>
      ),
      className: '!bg-emerald-50',
      onHeaderCell: () => ({ className: '!bg-emerald-200' }),
      children: [
        {
          title: (
            <AutoCalcTitle
              label="Số ngày ăn cơm"
              color="text-emerald-700"
              iconColor="text-emerald-400"
            />
          ),
          width: 80,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          render: (_v, r) => <ReadCell value={allowance(r).rice_days} />
        },
        {
          title: (
            <AutoCalcTitle
              label="Phụ cấp cơm ca ngày"
              color="text-emerald-700"
              iconColor="text-emerald-400"
            />
          ),
          width: 110,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          render: (_v, r) => (
            <ReadCell value={allowance(r).rice_allowance} isMoney />
          )
        },
        {
          title: (
            <AutoCalcTitle
              label="Số ca đêm"
              color="text-emerald-700"
              iconColor="text-emerald-400"
            />
          ),
          width: 75,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          render: (_v, r) => <ReadCell value={allowance(r).night_shift_count} />
        },
        {
          title: (
            <AutoCalcTitle
              label="Phụ cấp ca đêm"
              color="text-emerald-700"
              iconColor="text-emerald-400"
            />
          ),
          width: 110,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          render: (_v, r) => (
            <ReadCell value={allowance(r).night_allowance} isMoney />
          )
        },
        {
          title: (
            <AutoCalcTitle
              label="Số ngày tăng ca"
              color="text-emerald-700"
              iconColor="text-emerald-400"
            />
          ),
          width: 85,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          render: (_v, r) => (
            <ReadCell value={allowance(r).overtime_day_count} />
          )
        },
        {
          title: (
            <AutoCalcTitle
              label="Phụ cấp tăng ca"
              color="text-emerald-700"
              iconColor="text-emerald-400"
            />
          ),
          width: 110,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          render: (_v, r) => (
            <ReadCell value={allowance(r).overtime_allowance} isMoney />
          )
        },
        {
          title: (
            <span className="font-semibold text-emerald-600">Ghi chú</span>
          ),
          width: 90,
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={allowance(r).overtime_allowance_notice}
              onSave={(v) => save(r.id, 'allowance_overtime_detail_notice', v)}
            />
          )
        },
        {
          title: (
            <AutoCalcTitle
              label="Số ngày lễ Tết"
              color="text-emerald-700"
              iconColor="text-emerald-400"
            />
          ),
          width: 80,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          render: (_v, r) => <ReadCell value={allowance(r).holiday_count} />
        },
        {
          title: (
            <AutoCalcTitle
              label="Tiền lễ Tết"
              color="text-emerald-700"
              iconColor="text-emerald-400"
            />
          ),
          width: 100,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          render: (_v, r) => (
            <ReadCell value={allowance(r).holiday_pay} isMoney />
          )
        },
        {
          title: (
            <span className="font-semibold text-emerald-600">Ghi chú</span>
          ),
          width: 90,
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={allowance(r).holiday_pay_notice}
              onSave={(v) => save(r.id, 'holidays_money_notice', v)}
            />
          )
        },
        {
          title: (
            <AutoCalcTitle
              label="Số ngày phép năm"
              color="text-emerald-700"
              iconColor="text-emerald-400"
            />
          ),
          width: 90,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          render: (_v, r) => <ReadCell value={allowance(r).paid_leave_count} />
        },
        {
          title: (
            <AutoCalcTitle
              label="Tiền phép năm"
              color="text-emerald-700"
              iconColor="text-emerald-400"
            />
          ),
          width: 100,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          render: (_v, r) => (
            <ReadCell value={allowance(r).paid_leave_pay} isMoney />
          )
        },
        {
          title: (
            <span className="font-semibold text-emerald-600">Ghi chú</span>
          ),
          width: 90,
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={allowance(r).paid_leave_pay_notice}
              onSave={(v) => save(r.id, 'paid_holidays_money_notice', v)}
            />
          )
        }
      ]
    },

    // ── D. CÔNG TÁC (nhập liệu) ───────────────────────────────────────────────
    {
      title: (
        <div className="py-1 text-center">
          <div className="text-sm font-bold text-purple-700 uppercase">
            D. Công Tác
          </div>
          <div className="text-[10px] text-purple-400">Nhập tay</div>
        </div>
      ),
      className: '!bg-purple-200',
      children: [
        {
          title: (
            <EditableTitle
              label="Số giờ công tác"
              color="text-purple-700"
              iconColor="text-purple-500"
            />
          ),
          width: 90,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-purple-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              value={allowance(r).travel_hours}
              onSave={(v) => save(r.id, 'business_travel_hours', v)}
            />
          )
        },
        {
          title: (
            <EditableTitle
              label="Đơn giá CT/giờ"
              color="text-purple-700"
              iconColor="text-purple-500"
            />
          ),
          width: 95,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-purple-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              isMoney
              value={allowance(r).travel_rate}
              onSave={(v) => save(r.id, 'business_travel_unit_price_hour', v)}
            />
          )
        },
        {
          title: (
            <AutoCalcTitle
              label="Lương công tác GCN"
              color="text-purple-700"
              iconColor="text-purple-400"
            />
          ),
          width: 115,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-purple-100' }),
          render: (_v, r) => (
            <ReadCell
              value={allowance(r).travel_salary}
              isMoney
              color="text-purple-600"
            />
          )
        },
        {
          title: <span className="font-semibold text-purple-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-purple-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={
                (allowance(r) as Record<string, string | undefined>)
                  .travel_salary_notice
              }
              onSave={(v) => save(r.id, 'gcn_business_travel_salary_notice', v)}
            />
          )
        },
        {
          title: (
            <EditableTitle
              label="Số lần đi công tác"
              color="text-purple-700"
              iconColor="text-purple-500"
            />
          ),
          width: 100,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-purple-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              value={allowance(r).travel_trips}
              onSave={(v) => save(r.id, 'number_of_business_trips', v)}
            />
          )
        },
        {
          title: (
            <EditableTitle
              label="Đơn giá xăng CT/ngày"
              color="text-purple-700"
              iconColor="text-purple-500"
            />
          ),
          width: 120,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-purple-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              isMoney
              value={allowance(r).travel_fuel_rate}
              onSave={(v) => save(r.id, 'business_fuel_unit_price_day', v)}
            />
          )
        },
        {
          title: (
            <AutoCalcTitle
              label="Phụ cấp xăng GCN"
              color="text-purple-700"
              iconColor="text-purple-400"
            />
          ),
          width: 110,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-purple-100' }),
          render: (_v, r) => (
            <ReadCell
              value={allowance(r).travel_fuel}
              isMoney
              color="text-purple-600"
            />
          )
        },
        {
          title: <span className="font-semibold text-purple-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-purple-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={
                (allowance(r) as Record<string, string | undefined>)
                  .travel_fuel_notice
              }
              onSave={(v) =>
                save(r.id, 'allowance_gcn_business_fuel_notice', v)
              }
            />
          )
        }
      ]
    },

    // ── E. CÁC KHOẢN CỘNG THÊM (nhập liệu) ───────────────────────────────────
    {
      title: (
        <div className="py-1 text-center">
          <div className="text-sm font-bold text-amber-700 uppercase">
            E. Khoản Cộng
          </div>
          <div className="text-[10px] text-amber-400">Nhập bổ sung</div>
        </div>
      ),
      className: '!bg-amber-200',
      children: [
        {
          title: (
            <EditableTitle
              label="Tiền giới thiệu người"
              color="text-amber-700"
              iconColor="text-amber-500"
            />
          ),
          width: 115,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-amber-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              isMoney
              value={allowance(r).referral_money}
              onSave={(v) => save(r.id, 'money_referral_people', v)}
            />
          )
        },
        {
          title: <span className="font-semibold text-amber-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-amber-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={
                (allowance(r) as Record<string, string | undefined>)
                  .referral_money_notice
              }
              onSave={(v) => save(r.id, 'money_referral_people_notice', v)}
            />
          )
        },
        {
          title: (
            <EditableTitle
              label="Phụ cấp khác"
              color="text-amber-700"
              iconColor="text-amber-500"
            />
          ),
          width: 100,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-amber-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              isMoney
              value={allowance(r).other_allowance}
              onSave={(v) => save(r.id, 'allowance_diffrent', v)}
            />
          )
        },
        {
          title: <span className="font-semibold text-amber-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-amber-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={allowance(r).other_allowance_notice}
              onSave={(v) => save(r.id, 'allowance_diffrent_notice', v)}
            />
          )
        },
        {
          title: (
            <EditableTitle
              label="Thưởng chuyên cần"
              color="text-amber-700"
              iconColor="text-amber-500"
            />
          ),
          width: 110,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-amber-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              isMoney
              value={allowance(r).attendance_bonus}
              onSave={(v) => save(r.id, 'bonuses_for_attendance', v)}
            />
          )
        },
        {
          title: <span className="font-semibold text-amber-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-amber-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={allowance(r).attendance_bonus_notice}
              onSave={(v) => save(r.id, 'bonuses_for_attendance_notice', v)}
            />
          )
        },
        {
          title: (
            <EditableTitle
              label="Hoàn tiền KPI tháng trước"
              color="text-amber-700"
              iconColor="text-amber-500"
            />
          ),
          width: 125,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-amber-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              isMoney
              value={allowance(r).refund_kpi_previous_month}
              onSave={(v) => save(r.id, 'refund_kpi_previous_month', v)}
            />
          )
        },
        {
          title: <span className="font-semibold text-amber-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-amber-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={allowance(r).refund_kpi_previous_month_notice}
              onSave={(v) => save(r.id, 'refund_kpi_previous_month_notice', v)}
            />
          )
        },
        {
          title: (
            <EditableTitle
              label="Tiền ốm đau"
              color="text-amber-700"
              iconColor="text-amber-500"
            />
          ),
          width: 90,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-amber-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              isMoney
              value={allowance(r).sickness}
              onSave={(v) => save(r.id, 'sickness', v)}
            />
          )
        },
        {
          title: <span className="font-semibold text-amber-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-amber-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={
                (allowance(r) as Record<string, string | undefined>)
                  .sickness_notice
              }
              onSave={(v) => save(r.id, 'sickness_notice', v)}
            />
          )
        },
        {
          title: (
            <EditableTitle
              label="Tiền ma chay"
              color="text-amber-700"
              iconColor="text-amber-500"
            />
          ),
          width: 90,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-amber-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              isMoney
              value={allowance(r).funeral}
              onSave={(v) => save(r.id, 'funeral', v)}
            />
          )
        },
        {
          title: <span className="font-semibold text-amber-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-amber-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={
                (allowance(r) as Record<string, string | undefined>)
                  .funeral_notice
              }
              onSave={(v) => save(r.id, 'funeral_notice', v)}
            />
          )
        },
        {
          title: (
            <EditableTitle
              label="Tiền sinh nhật"
              color="text-amber-700"
              iconColor="text-amber-500"
            />
          ),
          width: 90,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-amber-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              isMoney
              value={allowance(r).birthday_money}
              onSave={(v) => save(r.id, 'birthday_money', v)}
            />
          )
        },
        {
          title: <span className="font-semibold text-amber-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-amber-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={allowance(r).birthday_money_notice}
              onSave={(v) => save(r.id, 'birthday_money_notice', v)}
            />
          )
        },
        {
          title: (
            <EditableTitle
              label="Lương kỳ trước thiếu"
              color="text-amber-700"
              iconColor="text-amber-500"
            />
          ),
          width: 115,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-amber-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              isMoney
              value={allowance(r).previous_debt}
              onSave={(v) => save(r.id, 'previous_period_debt', v)}
            />
          )
        },
        {
          title: <span className="font-semibold text-amber-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-amber-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={allowance(r).previous_debt_notice}
              onSave={(v) => save(r.id, 'previous_period_debt_notice', v)}
            />
          )
        }
      ]
    },

    // ── F. TỔNG THU NHẬP ──────────────────────────────────────────────────────
    {
      title: (
        <div className="py-1 text-center">
          <div className="text-sm font-bold text-indigo-700 uppercase">
            F. Tổng Thu Nhập
          </div>
        </div>
      ),
      className: '!bg-indigo-200',
      children: [
        {
          title: (
            <AutoCalcTitle
              label="Tổng thu nhập"
              color="text-indigo-700"
              iconColor="text-indigo-400"
            />
          ),
          width: 130,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-indigo-100' }),
          render: (_v, r) => (
            <span className="font-mono text-sm font-bold text-indigo-700">
              {fmtVND(summary(r).total_income)}
            </span>
          )
        }
      ]
    },

    // ── G. CÁC KHOẢN KHẤU TRỪ (nhập + tự tính) ───────────────────────────────
    {
      title: (
        <div className="py-1 text-center">
          <div className="text-sm font-bold text-red-700 uppercase">
            G. Khấu Trừ
          </div>
          <div className="text-[10px] text-red-400">BHXH / CĐ / KPI / Lỗi</div>
        </div>
      ),
      className: '!bg-red-200',
      children: [
        {
          title: (
            <AutoCalcTitle
              label="Trừ BHXH (10.5%)"
              color="text-red-700"
              iconColor="text-red-400"
            />
          ),
          width: 105,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <ReadCell
              value={summary(r).insurance_deduction}
              isMoney
              color="text-red-600"
            />
          )
        },
        {
          title: <span className="font-semibold text-red-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={summary(r).insurance_deduction_notice}
              onSave={(v) => save(r.id, 'insurance_deduction_notice', v)}
            />
          )
        },
        {
          title: (
            <EditableTitle
              label="Tạm ứng"
              color="text-red-700"
              iconColor="text-red-500"
            />
          ),
          width: 95,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              isMoney
              value={summary(r).advance_money}
              onSave={(v) => save(r.id, 'advance_money', v)}
            />
          )
        },
        {
          title: <span className="font-semibold text-red-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={summary(r).advance_money_notice}
              onSave={(v) => save(r.id, 'advance_money_notice', v)}
            />
          )
        },
        {
          title: (
            <AutoCalcTitle
              label="Phí công đoàn (0.5%)"
              color="text-red-700"
              iconColor="text-red-400"
            />
          ),
          width: 115,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <ReadCell
              value={summary(r).union_fee}
              isMoney
              color="text-red-500"
            />
          )
        },
        {
          title: <span className="font-semibold text-red-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={summary(r).union_fee_notice}
              onSave={(v) => save(r.id, 'unicon_deduction_notice', v)}
            />
          )
        },
        {
          title: (
            <EditableTitle
              label="Nghỉ có phép"
              color="text-red-700"
              iconColor="text-red-500"
            />
          ),
          width: 105,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              value={kpi(r).days_leave_allowed}
              onSave={(v) => save(r.id, 'daysleave_allowed_timekeeping', v)}
            />
          )
        },
        {
          title: <span className="font-semibold text-red-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={kpi(r).days_leave_allowed_notice}
              onSave={(v) => save(r.id, 'days_leave_allowed_notice', v)}
            />
          )
        },
        {
          title: (
            <EditableTitle
              label="Nghỉ không phép"
              color="text-red-700"
              iconColor="text-red-500"
            />
          ),
          width: 120,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              value={kpi(r).days_leave_not_allowed}
              onSave={(v) => save(r.id, 'daysleave_notallowed_timekeeping', v)}
            />
          )
        },
        {
          title: <span className="font-semibold text-red-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={kpi(r).days_leave_not_allowed_notice}
              onSave={(v) => save(r.id, 'days_leave_not_allowed_notice', v)}
            />
          )
        },
        {
          title: (
            <EditableTitle
              label="Số lỗi nặng"
              color="text-red-700"
              iconColor="text-red-500"
            />
          ),
          width: 85,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              value={kpi(r).error_serious}
              onSave={(v) => save(r.id, 'error_serious', v)}
            />
          )
        },
        {
          title: <span className="font-semibold text-red-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={kpi(r).error_serious_notice}
              onSave={(v) => save(r.id, 'subtract_error_serious_notice', v)}
            />
          )
        },
        {
          title: (
            <EditableTitle
              label="Số lỗi nhẹ"
              color="text-red-700"
              iconColor="text-red-500"
            />
          ),
          width: 85,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              value={kpi(r).error_minor}
              onSave={(v) => save(r.id, 'error_minor', v)}
            />
          )
        },
        {
          title: <span className="font-semibold text-red-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={kpi(r).error_minor_notice}
              onSave={(v) => save(r.id, 'subtract_error_minor_notice', v)}
            />
          )
        },
        {
          title: (
            <EditableTitle
              label="Trừ KPI"
              color="text-red-700"
              iconColor="text-red-500"
            />
          ),
          width: 100,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <EditableCell
              disabled={isSaving(r.id)}
              isMoney
              value={kpi(r).kpi_deduction}
              onSave={(v) => save(r.id, 'KPI_Subtraction_payroll', v)}
            />
          )
        },
        {
          title: <span className="font-semibold text-red-600">Ghi chú</span>,
          width: 90,
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <EditableNote
              disabled={isSaving(r.id)}
              value={summary(r).kpi_deduction_notice}
              onSave={(v) => save(r.id, 'kpi_subtraction_notice', v)}
            />
          )
        },
        {
          title: (
            <AutoCalcTitle
              label="Tổng khấu trừ"
              color="text-red-700"
              iconColor="text-red-400"
            />
          ),
          width: 110,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <ReadCell
              value={summary(r).total_deductions}
              isMoney
              color="text-red-700"
            />
          )
        }
      ]
    },

    // ── H. KẾT QUẢ CUỐI ──────────────────────────────────────────────────────
    {
      title: (
        <div className="py-1 text-center">
          <div className="text-sm font-bold text-emerald-700 uppercase">
            H. Kết Quả
          </div>
          <div className="text-[10px] text-emerald-400">
            Thực lãnh & BHXH CTy
          </div>
        </div>
      ),
      className: '!bg-emerald-200',
      fixed: 'right',
      children: [
        {
          title: (
            <span className="font-semibold text-gray-600">
              BHXH Công ty (21.5%)
            </span>
          ),
          width: 130,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          onCell: () => ({ className: '!bg-white' }),
          render: (_v, r) => (
            <ReadCell
              value={summary(r).company_insurance}
              isMoney
              color="text-gray-500"
            />
          )
        },
        {
          title: (
            <span className="text-sm font-bold text-emerald-700">
              THỰC LÃNH
            </span>
          ),
          width: 140,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          onCell: () => ({ className: '!bg-emerald-50' }),
          render: (_v, r) => (
            <span className="font-mono text-[15px] font-bold text-emerald-700">
              {fmtVND(summary(r).actually_received)}
            </span>
          )
        },
        {
          title: 'Hình thức nhận',
          width: 110,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          onCell: () => ({ className: '!bg-white' }),
          render: (_v, r) => (
            <EditableSelect
              disabled={isSaving(r.id)}
              value={summary(r).forms_of_payment}
              onSave={(v) => save(r.id, 'forms_of_payment', v)}
            />
          )
        }
      ]
    }
  ];

  if (employees.length === 0 && !isLoading) {
    return (
      <div className="py-16 text-center">
        <FaCalculator className="mx-auto mb-4 text-5xl text-gray-200" />
        <p className="text-gray-400">Chưa có dữ liệu nhân viên.</p>
        <p className="mt-1 text-sm text-gray-400">
          Vui lòng tạo bảng lương và thêm nhân viên trước.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hướng dẫn */}
      <div className="flex flex-wrap items-center gap-5 rounded-xl border border-gray-200 bg-gradient-to-r from-slate-50 to-amber-50 px-5 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
            <FaLock size={9} /> Cột xám
          </span>
          Giá trị tự động tính theo công thức Excel — không chỉnh sửa
        </div>
        <div className="flex items-center gap-2 text-sm text-amber-800">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
            <FaEdit size={9} /> Cột cam
          </span>
          Nhấn vào ô để nhập hoặc sửa — hệ thống tự lưu ngay sau khi rời ô
        </div>
      </div>

      {/* Tổng hợp nhanh */}
      {grandTotal && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card
            size="small"
            className="!rounded-xl !border-indigo-100 !bg-gradient-to-br !from-indigo-50 !to-white"
          >
            <Statistic
              title={
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <FaChartLine className="text-indigo-400" /> Tổng thu nhập
                </span>
              }
              value={grandTotal.total_income}
              formatter={(v) => fmtVND(Number(v))}
              suffix="₫"
              valueStyle={{ fontSize: 17, fontWeight: 700, color: '#4338ca' }}
            />
          </Card>
          <Card
            size="small"
            className="!rounded-xl !border-red-100 !bg-gradient-to-br !from-red-50 !to-white"
          >
            <Statistic
              title={
                <span className="text-xs text-gray-500">
                  Tổng BHXH & Khấu trừ
                </span>
              }
              value={grandTotal.total_deductions}
              formatter={(v) => fmtVND(Number(v))}
              suffix="₫"
              valueStyle={{ fontSize: 17, fontWeight: 700, color: '#dc2626' }}
            />
          </Card>
          <Card
            size="small"
            className="!rounded-xl !border-emerald-100 !bg-gradient-to-br !from-emerald-50 !to-white"
          >
            <Statistic
              title={
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <FaMoneyBillWave className="text-emerald-400" /> Tổng thực
                  lãnh
                </span>
              }
              value={grandTotal.total_net_pay}
              formatter={(v) => fmtVND(Number(v))}
              suffix="₫"
              valueStyle={{ fontSize: 17, fontWeight: 700, color: '#059669' }}
            />
          </Card>
          <Card
            size="small"
            className="!rounded-xl !border-gray-100 !bg-gradient-to-br !from-gray-50 !to-white"
          >
            <Statistic
              title={
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <FaUsers className="text-gray-400" /> Số nhân viên
                </span>
              }
              value={grandTotal.count}
              suffix="người"
              valueStyle={{ fontSize: 17, fontWeight: 700 }}
            />
          </Card>
        </div>
      )}

      {/* Bảng tính lương đầy đủ */}
      <Table<SalaryWebEmployee>
        rowKey="id"
        columns={columns}
        dataSource={employees}
        loading={isLoading}
        scroll={{ x: 'max-content' }}
        sticky={{ offsetHeader: 64 }}
        pagination={false}
        size="small"
        bordered
        className="excel-table [&_.ant-table-cell]:!px-2.5 [&_.ant-table-cell]:!py-2 [&_.ant-table-thead_th]:!py-2.5 [&_.ant-table-thead_th]:!text-xs"
      />
    </div>
  );
}
