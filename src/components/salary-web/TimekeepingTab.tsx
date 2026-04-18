import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableColumnsType, message, Tag, Spin, InputNumber } from 'antd';
import { useState, useMemo, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';

import {
  updateTimekeepingBulk,
  updateAdjustments,
  calculateSalary
} from '@services/SalaryWebService';
import type {
  SalaryWebEmployee,
  CompanyType,
  SalaryManager,
  AdjustmentsPayload
} from '@/types/salaryWebType';

interface Props {
  salaryManagerId: number;
  company: CompanyType;
  employees: SalaryWebEmployee[];
  loading: boolean;
  salaryManager?: SalaryManager;
}

type DraftState = Record<
  number,
  Record<
    string,
    { day_hours?: number; night_hours?: number; overtime_hours?: number }
  >
>;

type TimekeepingRow = {
  date: string;
  day_hours: number;
  night_hours: number;
  overtime_hours: number;
};

type BulkTimekeepingPayloadItem = {
  employee_id: string;
  timekeeping_data: TimekeepingRow[];
};

type ExtendedTimekeepingSummary = SalaryWebEmployee['timekeeping_summary'] & {
  workday_count_trial?: number;
  worknight_count_trial?: number;
  trial_overtime_count?: number;
  overtime_day_count_trial?: number;
};

type EditableAdjCellProps = {
  value: number | null | undefined;
  empId: number;
  field: string;
  color: string;
  isSaving: boolean;
  onSave: (empId: number, field: string, value: number | null) => void;
};

const EditableAdjCell = ({
  value,
  empId,
  field,
  color,
  isSaving,
  onSave
}: EditableAdjCellProps) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState<number | null>(value ?? null);

  const handleBlur = () => {
    setEditing(false);
    if (val !== (value ?? null)) onSave(empId, field, val);
  };

  if (editing) {
    return (
      <InputNumber
        autoFocus
        size="small"
        value={val}
        controls={false}
        onChange={(v) => setVal(v as number)}
        onBlur={handleBlur}
        onPressEnter={handleBlur}
        className="w-12 text-center text-xs"
      />
    );
  }
  return (
    <div
      onClick={() => {
        if (!isSaving) {
          setEditing(true);
          setVal(value ?? null);
        }
      }}
      className={`flex w-full cursor-pointer items-center justify-center rounded py-1 transition-colors ${isSaving ? 'opacity-50' : 'hover:bg-slate-100'} font-mono text-[11px] font-semibold ${color}`}
    >
      {value ? value : '—'}
    </div>
  );
};

const getTrialTimekeepingDisplay = (employee: SalaryWebEmployee) => {
  const summary = (employee.timekeeping_summary ||
    {}) as ExtendedTimekeepingSummary;
  const trialDay = summary.trial_day_count ?? summary.workday_count_trial ?? 0;

  const trialNight =
    summary.trial_night_count ?? summary.worknight_count_trial ?? 0;

  const trialOvertime =
    summary.trial_overtime_count ?? summary.overtime_day_count_trial ?? 0;

  return {
    trialDay,
    trialNight,
    trialOvertime
  };
};

export default function TimekeepingTab({
  salaryManagerId,
  company,
  employees,
  loading,
  salaryManager
}: Props) {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<DraftState>({});

  // Reset drafts when employees change
  useEffect(() => {
    setDrafts({});
  }, [employees]);

  const { mutate: saveBulkTimekeeping, isPending: isBulkSaving } = useMutation({
    mutationFn: async () => {
      const payloadData: BulkTimekeepingPayloadItem[] = [];
      Object.keys(drafts).forEach((empIdStr) => {
        const empId = Number(empIdStr);
        const empDrafts = drafts[empId];
        const entriesMap = new Map<string, TimekeepingRow>();

        const emp = employees.find((e) => e.id === empId);
        if (!emp) return;

        // Copy originals
        emp.timekeeping_daily?.forEach((orig) => {
          entriesMap.set(orig.date, {
            date: orig.date,
            day_hours: Number(orig.day_hours || 0),
            night_hours: Number(orig.night_hours || 0),
            overtime_hours: Number(orig.overtime_hours || 0)
          });
        });

        // Apply drafts
        Object.keys(empDrafts).forEach((date) => {
          const current = entriesMap.get(date) || {
            date,
            day_hours: 0,
            night_hours: 0,
            overtime_hours: 0
          };
          const d = empDrafts[date];
          if (d.day_hours !== undefined) current.day_hours = d.day_hours;
          if (d.night_hours !== undefined) current.night_hours = d.night_hours;
          if (d.overtime_hours !== undefined)
            current.overtime_hours = d.overtime_hours;
          entriesMap.set(date, current);
        });

        payloadData.push({
          employee_id: String(emp.employee_id),
          timekeeping_data: Array.from(entriesMap.values())
        });
      });

      const result = await updateTimekeepingBulk(salaryManagerId, {
        company,
        data: payloadData
      });

      if (payloadData.length > 0) {
        await calculateSalary(salaryManagerId, {
          company,
          employee_ids: null
        });
      }

      return result;
    },
    onSuccess: () => {
      message.success('Lưu chấm công thành công!');
      setDrafts({});
      queryClient.invalidateQueries({
        queryKey: ['salaryWebData', salaryManagerId, company]
      });
      queryClient.invalidateQueries({
        queryKey: ['payrollSummary', salaryManagerId, company]
      });
    },
    onError: () => {
      message.error('Lưu chấm công thất bại!');
    }
  });

  const dateRange = useMemo(() => {
    if (!salaryManager) return [];
    const start = dayjs(salaryManager.start_date);
    const end = dayjs(salaryManager.end_date);
    const dates: string[] = [];
    let current = start;
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      dates.push(current.format('YYYY-MM-DD'));
      current = current.add(1, 'day');
    }
    return dates;
  }, [salaryManager]);

  const updateDraft = (
    empId: number,
    date: string,
    field: 'day_hours' | 'night_hours' | 'overtime_hours',
    valStr: string
  ) => {
    const val = valStr === '' ? 0 : parseFloat(valStr) || 0;
    setDrafts((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [date]: {
          ...(prev[empId]?.[date] || {}),
          [field]: val
        }
      }
    }));
  };

  const { mutate: mutateAdj, isPending: isSavingAdj } = useMutation({
    mutationFn: async (payload: {
      employeeCode: string;
      data: AdjustmentsPayload;
    }) => {
      await updateAdjustments(
        salaryManagerId,
        payload.employeeCode,
        payload.data
      );
      await calculateSalary(salaryManagerId, {
        company,
        employee_ids: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['salaryWebData', salaryManagerId, company]
      });
      queryClient.invalidateQueries({
        queryKey: ['payrollSummary', salaryManagerId, company]
      });
    },
    onError: () => {
      message.error('Lỗi khi lưu.');
    }
  });

  const saveAdj = useCallback(
    (empId: number, field: string, value: number | null) => {
      const employeeCode = employees.find(
        (employee) => employee.id === empId
      )?.employee_id;
      if (!employeeCode) return;

      mutateAdj({
        employeeCode: String(employeeCode),
        data: { company, [field]: value }
      });
    },
    [company, employees, mutateAdj]
  );

  const columns = useMemo(() => {
    // ── FIXED COLUMNS ──
    const cols: TableColumnsType<SalaryWebEmployee> = [
      {
        title: 'STT',
        width: 50,
        align: 'center',
        fixed: 'left',
        render: (_v, _r, i) => (
          <span className="font-mono text-[11px] font-semibold text-gray-500">
            {i + 1}
          </span>
        )
      },
      {
        title: 'Nhân viên',
        width: 220,
        fixed: 'left',
        align: 'left',
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
      // Cột tổng tóm tắt (cố định, tính từ dữ liệu)
      {
        title: (
          <span className="text-[9px] font-bold text-amber-500">
            TỔNG GIỜ NGÀY
          </span>
        ),
        width: 70,
        align: 'center',
        fixed: 'left',
        render: (_v, r) => (
          <span className="font-mono text-[11px] font-bold text-amber-600">
            {r.timekeeping_summary?.total_day_hours || '—'}
          </span>
        )
      },
      {
        title: (
          <span className="text-[9px] font-bold text-slate-600">
            TỔNG GIỜ ĐÊM
          </span>
        ),
        width: 70,
        align: 'center',
        fixed: 'left',
        render: (_v, r) => (
          <span className="font-mono text-[11px] font-bold text-slate-700">
            {r.timekeeping_summary?.total_night_hours || '—'}
          </span>
        )
      },
      {
        title: (
          <span className="text-[9px] font-bold text-emerald-500">
            TỔNG TĂNG CA
          </span>
        ),
        width: 70,
        align: 'center',
        fixed: 'left',
        render: (_v, r) => (
          <span className="font-mono text-[11px] font-bold text-emerald-600">
            {r.timekeeping_summary?.total_overtime_hours || '—'}
          </span>
        )
      },
      {
        title: (
          <span className="text-[9px] font-bold text-gray-500">
            L.NGÀY (TV)
          </span>
        ),
        width: 65,
        align: 'center',
        fixed: 'left',
        render: (_v, r) => {
          const val = getTrialTimekeepingDisplay(r).trialDay;
          return (
            <span className="font-mono text-[11px] font-semibold text-gray-500">
              {val || '—'}
            </span>
          );
        }
      },
      {
        title: (
          <span className="text-[9px] font-bold text-gray-500">L.ĐÊM (TV)</span>
        ),
        width: 65,
        align: 'center',
        fixed: 'left',
        render: (_v, r) => {
          const val = getTrialTimekeepingDisplay(r).trialNight;
          return (
            <span className="font-mono text-[11px] font-semibold text-gray-500">
              {val || '—'}
            </span>
          );
        }
      },
      {
        title: (
          <span className="text-[9px] font-bold text-gray-500">L.TC (TV)</span>
        ),
        width: 65,
        align: 'center',
        fixed: 'left',
        render: (_v, r) => {
          const val = getTrialTimekeepingDisplay(r).trialOvertime;
          return (
            <span className="font-mono text-[11px] font-semibold text-gray-500">
              {val || '—'}
            </span>
          );
        }
      }
    ];

    // ── DYNAMIC DATES COLUMNS ──
    dateRange.forEach((date) => {
      const d = dayjs(date);
      const isWeekend = d.day() === 0 || d.day() === 6;

      cols.push({
        title: (
          <div
            className={`flex flex-col items-center ${isWeekend ? 'text-red-500' : 'text-gray-700'}`}
          >
            <span className="text-[13px] leading-none font-bold">
              {d.format('DD/MM')}
            </span>
            <span className="mt-1 text-[9px] font-medium">
              {d.format('ddd').toUpperCase()}
            </span>
          </div>
        ),
        dataIndex: 'id',
        key: date,
        width: 50,
        align: 'center',
        render: (_v, r) => {
          const empId = r.id;
          const orig = r.timekeeping_daily?.find((x) => x.date === date);
          const draft = drafts[empId]?.[date];

          const dH = draft?.day_hours ?? orig?.day_hours ?? '';
          const nH = draft?.night_hours ?? orig?.night_hours ?? '';
          const oH = draft?.overtime_hours ?? orig?.overtime_hours ?? '';

          const inputClass =
            'w-10 text-center text-sm font-mono font-semibold border-2 rounded-lg outline-none transition-all focus:ring-2 focus:border-transparent py-0.5';

          const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
              // To prevent calling mutation if no changes or already pending
              if (!isBulkSaving) {
                saveBulkTimekeeping();
              }
            }
          };

          return (
            <div className="flex flex-col items-center gap-1 pb-1">
              <input
                className={`${inputClass} border-amber-200 bg-amber-50 text-amber-700 placeholder:text-amber-200 focus:ring-amber-400`}
                value={dH === 0 ? '' : dH}
                onChange={(e) =>
                  updateDraft(empId, date, 'day_hours', e.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="-"
                title="Giờ Ngày (Mặt trời)"
              />
              <input
                className={`${inputClass} border-slate-300 bg-slate-100 text-slate-800 placeholder:text-slate-300 focus:ring-slate-500`}
                value={nH === 0 ? '' : nH}
                onChange={(e) =>
                  updateDraft(empId, date, 'night_hours', e.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="-"
                title="Giờ Đêm (Trời tối)"
              />
              <input
                className={`${inputClass} border-emerald-200 bg-emerald-50 text-emerald-700 placeholder:text-emerald-200 focus:ring-emerald-400`}
                value={oH === 0 ? '' : oH}
                onChange={(e) =>
                  updateDraft(empId, date, 'overtime_hours', e.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="-"
                title="Tăng Ca (Thêm giờ)"
              />
            </div>
          );
        }
      });
    });

    // ── SUMMARY COLUMNS (phải bảng) — khớp sheet "Bảng nhập công" Excel ─────
    // Các cột này hiển thị tổng kết từng NV sau dãy cột ngày
    const summaryDefs: {
      title: string;
      field: keyof (typeof employees)[0]['timekeeping_summary'];
      color: string;
    }[] = [
      {
        title: 'PC cơm ca ngày',
        field: 'rice_day_count',
        color: 'text-amber-700'
      },
      {
        title: 'PC cơm ca đêm',
        field: 'night_shift_count',
        color: 'text-indigo-700'
      },
      {
        title: 'Số ngày PC tăng ca',
        field: 'overtime_day_count',
        color: 'text-orange-700'
      }
    ];

    summaryDefs.forEach(({ title, field, color }) => {
      cols.push({
        title: (
          <span className={`text-[9px] font-semibold ${color}`}>{title}</span>
        ),
        width: 80,
        align: 'center',
        render: (_v, r) => {
          const val = r.timekeeping_summary?.[field];
          return (
            <span
              className={`font-mono text-[11px] ${val ? color + ' font-semibold' : 'text-gray-300'}`}
            >
              {val || '—'}
            </span>
          );
        }
      });
    });

    // Các cột Edit trực tiếp trong bảng nhập công (Lễ tết, Phép năm, Có phép, Không phép)
    cols.push({
      title: (
        <span className="text-[9px] font-semibold text-emerald-700">
          Ngày lễ, tết
        </span>
      ),
      width: 75,
      align: 'center',
      render: (_v, r) => (
        <EditableAdjCell
          value={r.timekeeping_summary?.holidays_count}
          empId={r.id}
          field="holidays_count"
          color="text-emerald-700"
          isSaving={isSavingAdj}
          onSave={saveAdj}
        />
      )
    });
    cols.push({
      title: (
        <span className="text-[9px] font-semibold text-teal-700">Phép năm</span>
      ),
      width: 70,
      align: 'center',
      render: (_v, r) => (
        <EditableAdjCell
          value={r.timekeeping_summary?.paid_holidays_count}
          empId={r.id}
          field="paid_holidays_count"
          color="text-teal-700"
          isSaving={isSavingAdj}
          onSave={saveAdj}
        />
      )
    });
    cols.push({
      title: (
        <span className="text-[9px] font-semibold text-rose-700">Có phép</span>
      ),
      width: 65,
      align: 'center',
      render: (_v, r) => (
        <EditableAdjCell
          value={r.timekeeping_summary?.days_leave_allowed}
          empId={r.id}
          field="daysleave_allowed_timekeeping"
          color="text-rose-700"
          isSaving={isSavingAdj}
          onSave={saveAdj}
        />
      )
    });
    cols.push({
      title: (
        <span className="text-[9px] font-semibold text-red-700">
          Không phép
        </span>
      ),
      width: 70,
      align: 'center',
      render: (_v, r) => (
        <EditableAdjCell
          value={r.timekeeping_summary?.days_leave_not_allowed}
          empId={r.id}
          field="daysleave_notallowed_timekeeping"
          color="text-red-700"
          isSaving={isSavingAdj}
          onSave={saveAdj}
        />
      )
    });

    return cols;
  }, [
    dateRange,
    drafts,
    isBulkSaving,
    saveBulkTimekeeping,
    isSavingAdj,
    saveAdj
  ]);

  return (
    <div className="space-y-4">
      {/* Thanh hướng dẫn */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-gradient-to-r from-amber-50/80 via-slate-50/60 to-emerald-50/80 px-5 py-3">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
          <span className="flex items-center gap-1.5">
            <span className="h-4 w-4 flex-shrink-0 rounded border border-amber-400 bg-amber-300"></span>
            <strong className="text-amber-600">Vàng</strong> = Giờ ngày
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-4 w-4 flex-shrink-0 rounded border border-slate-400 bg-slate-300"></span>
            <strong className="text-slate-700">Xám đậm</strong> = Giờ đêm
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-4 w-4 flex-shrink-0 rounded border border-emerald-400 bg-emerald-300"></span>
            <strong className="text-emerald-600">Xanh lá</strong> = Tăng ca
          </span>
          <span className="text-xs text-gray-500">
            — Nhập số giờ rồi nhấn{' '}
            <kbd className="rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
              Enter
            </kbd>{' '}
            hoặc click ra ngoài để lưu
          </span>
          <span className="text-xs text-emerald-600">
            — Nhóm cột "Nghỉ phép/Lễ" bên phải cùng có thể bấm vào số để nhập
            liệu.
          </span>
        </div>
        {isBulkSaving && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Spin size="small" /> Đang lưu...
          </div>
        )}
      </div>

      <Table<SalaryWebEmployee>
        rowKey="id"
        columns={columns}
        dataSource={employees}
        loading={loading}
        scroll={{ x: 'max-content' }}
        sticky={{ offsetHeader: 64 }}
        pagination={false}
        size="small"
        bordered
        className="[&_.ant-table-cell]:!px-1.5 [&_.ant-table-cell]:!py-1.5 [&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!py-2 [&_.ant-table-thead_th]:!text-xs"
      />
    </div>
  );
}
