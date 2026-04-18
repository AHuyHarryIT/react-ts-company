import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableColumnsType,
  InputNumber,
  Switch,
  Tag,
  Tooltip,
  message
} from 'antd';
import { useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';

import { calculateSalary, updateCategory } from '@services/SalaryWebService';
import type {
  SalaryWebEmployee,
  CompanyType,
  UpdateCategoryPayload
} from '@/types/salaryWebType';

interface Props {
  salaryManagerId: number;
  company: CompanyType;
  employees: SalaryWebEmployee[];
  loading: boolean;
  onRefresh: () => void;
}

type ExtendedCategory = SalaryWebEmployee['category'] & {
  probationary_salary_basic_26days?: number | null;
  probationary_salary_basic_hours?: number | null;
  probationary_salary_basic_extra_hours?: number | null;
};

const fmtVND = (v: number | null | undefined) => {
  if (v == null || v === 0) return '—';
  return new Intl.NumberFormat('vi-VN').format(Math.round(v));
};

// ─── Ô có thể chỉnh sửa ───────────────────────────────────────────────────────
const EditableCell = ({
  value,
  onSave,
  disabled
}: {
  value: number | null | undefined;
  onSave: (val: number | null) => void;
  disabled: boolean;
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
        formatter={(v) => {
          if (!v && v !== 0) return '';
          return `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }}
        parser={(v) => Number(v?.replace(/\./g, '') || 0)}
        className="!w-full font-mono text-sm [&_input]:text-center"
        controls={false}
        style={{ minWidth: 110 }}
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
      className={`flex min-h-[30px] cursor-pointer items-center justify-center rounded px-2 py-1 text-center font-mono text-sm transition-all select-none ${
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'border border-dashed border-transparent hover:border-amber-300 hover:bg-amber-50'
      }`}
      title={disabled ? 'Đang cập nhật...' : 'Nhấn để sửa'}
    >
      <span
        className={value ? 'font-semibold text-amber-700' : 'text-gray-300'}
      >
        {value ? fmtVND(value) : '—'}
      </span>
    </div>
  );
};

// ─── Ô chỉ đọc (tự tính) ─────────────────────────────────────────────────────
const ReadCell = ({
  value,
  colorClass = 'text-blue-600'
}: {
  value: number | null | undefined;
  colorClass?: string;
}) => (
  <span
    className={`font-mono text-sm ${value ? colorClass + ' font-semibold' : 'text-gray-300'}`}
  >
    {value ? fmtVND(value) : '—'}
  </span>
);

export default function CategoryTab({
  salaryManagerId,
  company,
  employees,
  loading,
  onRefresh
}: Props) {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async ({
      employeeCode,
      data
    }: {
      employeeCode: string;
      data: UpdateCategoryPayload;
    }) => {
      await updateCategory(salaryManagerId, employeeCode, data);
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
      message.error('Có lỗi khi cập nhật. Vui lòng thử lại.');
    }
  });

  const cell = (
    field: keyof UpdateCategoryPayload,
    value: number | null | undefined,
    record: SalaryWebEmployee
  ) => (
    <EditableCell
      value={value}
      disabled={saveMutation.isPending}
      onSave={(v) =>
        saveMutation.mutate({
          employeeCode: String(record.employee_id),
          data: { company, [field]: v } as UpdateCategoryPayload
        })
      }
    />
  );
  const categoryExtra = (record: SalaryWebEmployee): ExtendedCategory =>
    record.category as ExtendedCategory;

  const columns: TableColumnsType<SalaryWebEmployee> = [
    // ── CỐ ĐỊNH TRÁI ──────────────────────────────────────────────────────────
    {
      title: 'STT',
      width: 50,
      align: 'center',
      fixed: 'left',
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
    {
      title: (
        <Tooltip title="VP = Văn phòng, CN = Công nhân. Nhấn vào Tag để đổi.">
          <span className="flex items-center gap-1">
            Loại NV <FaInfoCircle size={11} className="text-gray-400" />
          </span>
        </Tooltip>
      ),
      width: 95,
      align: 'center',
      render: (_v, r) => (
        <Tooltip title="Nhấn để đổi loại VP/CN">
          <Tag
            color={r.employee_type === 'office' ? 'blue' : 'volcano'}
            className="!m-0 cursor-pointer px-3 py-0.5 text-xs font-semibold transition-all hover:opacity-75 active:scale-95"
            onClick={() =>
              saveMutation.mutate({
                employeeCode: String(r.employee_id),
                data: {
                  company,
                  employee_type:
                    r.employee_type === 'office' ? 'worker' : 'office'
                } as UpdateCategoryPayload
              })
            }
          >
            {r.employee_type === 'office' ? 'Văn phòng' : 'Công nhân'}
          </Tag>
        </Tooltip>
      )
    },

    // ── THỬ VIỆC / THÁNG ĐẦU ────────────────────────────────────────────────
    // Logic: Chỉ áp dụng khi NV chưa có salary_basic (NV mới dùng lương ngày)
    // Các cột tự tính KHÔNG dùng salary_basic mà dùng salary_day * 8 * 26 (ước lượng)
    {
      title: (
        <div className="py-1 text-center">
          <div className="text-sm font-bold tracking-wide text-orange-600 uppercase">
            Thử Việc / Tháng Đầu
          </div>
          <div className="mt-0.5 text-xs text-orange-400">
            Dành cho NV chưa chính thức
          </div>
        </div>
      ),
      className: '!bg-orange-200',
      children: [
        {
          title: (
            <span className="font-semibold text-orange-700">Lương ca ngày</span>
          ),
          width: 130,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-orange-100' }),
          render: (_v, r) =>
            r.category.salary_basic! > 0 ? (
              <span className="text-xs text-gray-300 italic">—</span>
            ) : (
              cell('salary_day', r.category.salary_day, r)
            )
        },
        {
          title: (
            <span className="font-semibold text-orange-700">Lương ca đêm</span>
          ),
          width: 130,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-orange-100' }),
          render: (_v, r) =>
            r.category.salary_basic! > 0 ? (
              <span className="text-xs text-gray-300 italic">—</span>
            ) : (
              cell('salary_night', r.category.salary_night, r)
            )
        },
        {
          title: (
            <Tooltip title="Ưu tiên số BE trả về; nếu chưa có thì preview ngay từ Lương ca ngày">
              <span className="font-semibold text-orange-700">
                TV: LCB / 26 ngày ⓘ
              </span>
            </Tooltip>
          ),
          width: 145,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-orange-100' }),
          render: (_v, r) => {
            const fromApi = categoryExtra(r).probationary_salary_basic_26days;
            const apiValue =
              typeof fromApi === 'number' && fromApi > 0 ? fromApi : null;
            const preview = r.category.salary_day
              ? r.category.salary_day * 26
              : null;
            return (
              <ReadCell
                value={apiValue ?? preview}
                colorClass="text-orange-700"
              />
            );
          }
        },
        {
          title: (
            <Tooltip title="Ưu tiên số BE trả về; nếu chưa có thì preview = (LCB/26) / 204">
              <span className="font-semibold text-orange-700">
                TV: LCB / giờ ⓘ
              </span>
            </Tooltip>
          ),
          width: 130,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-orange-100' }),
          render: (_v, r) => {
            const fromApi = categoryExtra(r).probationary_salary_basic_hours;
            const apiValue =
              typeof fromApi === 'number' && fromApi > 0 ? fromApi : null;
            const from26 = categoryExtra(r).probationary_salary_basic_26days;
            const apiFrom26 =
              typeof from26 === 'number' && from26 > 0 ? from26 : null;
            const preview26 =
              apiFrom26 ??
              (r.category.salary_day ? r.category.salary_day * 26 : null);
            const preview = preview26 ? preview26 / 204 : null;
            return (
              <ReadCell
                value={apiValue ?? preview}
                colorClass="text-orange-700"
              />
            );
          }
        },
        {
          title: (
            <Tooltip title="Ưu tiên số BE trả về; nếu chưa có thì preview = (LCB/giờ) x 1.5">
              <span className="font-semibold text-orange-700">
                TV: TC / giờ ⓘ
              </span>
            </Tooltip>
          ),
          width: 125,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-orange-100' }),
          render: (_v, r) => {
            const fromApi =
              categoryExtra(r).probationary_salary_basic_extra_hours;
            const apiValue =
              typeof fromApi === 'number' && fromApi > 0 ? fromApi : null;
            const fromHour = categoryExtra(r).probationary_salary_basic_hours;
            const apiFromHour =
              typeof fromHour === 'number' && fromHour > 0 ? fromHour : null;
            const from26 = categoryExtra(r).probationary_salary_basic_26days;
            const apiFrom26 =
              typeof from26 === 'number' && from26 > 0 ? from26 : null;
            const preview26 =
              apiFrom26 ??
              (r.category.salary_day ? r.category.salary_day * 26 : null);
            const previewHour =
              apiFromHour ?? (preview26 ? preview26 / 204 : null);
            const preview = previewHour ? previewHour * 1.5 : null;
            return (
              <ReadCell
                value={apiValue ?? preview}
                colorClass="text-orange-700"
              />
            );
          }
        },
        {
          title: (
            <span className="font-semibold text-orange-700">
              Phụ cấp học việc
            </span>
          ),
          width: 130,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-orange-100' }),
          render: (_v, r) =>
            r.category.salary_basic! > 0 ? (
              <span className="text-xs text-gray-300 italic">—</span>
            ) : (
              cell(
                'allowance_apprentice',
                categoryExtra(r).allowance_apprentice,
                r
              )
            )
        }
      ]
    },

    // ── LƯƠNG CHÍNH THỨC ────────────────────────────────────────────────────
    {
      title: (
        <div className="py-1 text-center">
          <div className="text-sm font-bold tracking-wide text-blue-700 uppercase">
            Lương Chính Thức
          </div>
          <div className="mt-0.5 text-xs text-blue-400">
            Lương CB / 26 ngày / 204 giờ
          </div>
        </div>
      ),
      className: '!bg-blue-200',
      children: [
        {
          title: (
            <span className="font-semibold text-blue-700">
              Lương CB / 26 ngày
            </span>
          ),
          width: 145,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-blue-100' }),
          render: (_v, r) => cell('salary_basic', r.category.salary_basic, r)
        },
        {
          title: (
            <Tooltip title="Tự tính = Lương CB ÷ 204 giờ">
              <span className="font-semibold text-blue-600">
                Lương CB/giờ ⓘ
              </span>
            </Tooltip>
          ),
          width: 130,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-blue-100' }),
          render: (_v, r) => <ReadCell value={r.category.regular_salary_hour} />
        },
        {
          title: (
            <Tooltip title="Tự tính = Lương CB/giờ × 1.5">
              <span className="font-semibold text-blue-600">
                Lương TC/giờ ⓘ
              </span>
            </Tooltip>
          ),
          width: 130,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-blue-100' }),
          render: (_v, r) => <ReadCell value={r.category.salary_overtime} />
        }
      ]
    },

    // ── PHỤ CẤP ────────────────────────────────────────────────────────────
    {
      title: (
        <div className="py-1 text-center">
          <div className="text-sm font-bold tracking-wide text-emerald-700 uppercase">
            Phụ Cấp
          </div>
          <div className="mt-0.5 text-xs text-emerald-400">
            Nhấn vào ô để sửa trực tiếp
          </div>
        </div>
      ),
      className: '!bg-emerald-50',
      onHeaderCell: () => ({ className: '!bg-emerald-200' }),
      children: [
        {
          title: (
            <span className="font-semibold text-emerald-700">Chuyên cần</span>
          ),
          width: 130,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          render: (_v, r) =>
            cell('allowance_diligence', r.category.allowance_diligence, r)
        },
        {
          title: (
            <span className="font-semibold text-emerald-700">Trách nhiệm</span>
          ),
          width: 130,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          render: (_v, r) =>
            cell(
              'allowance_responsibility',
              r.category.allowance_responsibility,
              r
            )
        },
        {
          title: (
            <span className="font-semibold text-emerald-700">
              PC tăng ca/ngày
            </span>
          ),
          width: 140,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          render: (_v, r) =>
            cell('allowance_overtime', r.category.allowance_overtime, r)
        },
        {
          title: (
            <span className="font-semibold text-emerald-700">PC ca đêm</span>
          ),
          width: 120,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          render: (_v, r) =>
            cell('allowance_night', r.category.allowance_night, r)
        },
        {
          title: (
            <span className="font-semibold text-emerald-700">PC cơm trưa</span>
          ),
          width: 120,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-emerald-100' }),
          render: (_v, r) =>
            cell('allowance_rice', r.category.allowance_rice, r)
        }
      ]
    },

    // ── BẢO HIỂM XÃ HỘI ────────────────────────────────────────────────────
    {
      title: (
        <div className="py-1 text-center">
          <div className="text-sm font-bold tracking-wide text-red-700 uppercase">
            Bảo Hiểm Xã Hội
          </div>
          <div className="mt-0.5 text-xs text-red-400">Toggle bật/tắt BHXH</div>
        </div>
      ),
      className: '!bg-red-50/50',
      children: [
        {
          title: <span className="font-semibold text-red-700">Đóng BHXH</span>,
          width: 100,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => {
            return (
              <Switch
                checked={r.category.has_insurance}
                disabled={saveMutation.isPending}
                checkedChildren="Có"
                unCheckedChildren="Không"
                onChange={(checked) =>
                  saveMutation.mutate({
                    employeeCode: String(r.employee_id),
                    data: {
                      company,
                      has_insurance: checked
                    } as UpdateCategoryPayload
                  })
                }
              />
            );
          }
        },
        {
          title: (
            <span className="font-semibold text-red-600">NV đóng (10.5%)</span>
          ),
          width: 135,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <ReadCell value={r.category.insurance} colorClass="text-red-600" />
          )
        },
        {
          title: (
            <span className="font-semibold text-red-600">Công ty (21.5%)</span>
          ),
          width: 140,
          align: 'center',
          onHeaderCell: () => ({ className: '!bg-red-100' }),
          render: (_v, r) => (
            <ReadCell
              value={r.category.company_insurance}
              colorClass="text-orange-600"
            />
          )
        }
      ]
    }
  ];

  return (
    <div className="space-y-4">
      {/* Thanh hướng dẫn */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-5 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded border border-orange-300 bg-orange-100"></span>
            Thử việc
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded border border-blue-300 bg-blue-100"></span>
            Chính thức
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded border border-emerald-300 bg-emerald-100"></span>
            Phụ cấp
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded border border-red-300 bg-red-100"></span>
            Bảo hiểm
          </span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-500">Nhấn vào ô để sửa trực tiếp</span>
        </div>
        <button
          onClick={onRefresh}
          className="text-sm font-medium text-indigo-500 transition-colors hover:text-indigo-700"
        >
          ↺ Làm mới
        </button>
      </div>

      <Table<SalaryWebEmployee>
        rowKey="id"
        columns={columns}
        dataSource={employees}
        loading={loading}
        scroll={{ x: 'max-content' }}
        sticky={{ offsetHeader: 64 }}
        pagination={false}
        size="middle"
        bordered
        className="category-table [&_.ant-table-cell]:!px-3 [&_.ant-table-cell]:!py-2 [&_.ant-table-thead_th]:!py-2.5 [&_.ant-table-thead_th]:!text-xs"
      />
    </div>
  );
}
