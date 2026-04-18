import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableColumnsType,
  Tag,
  Statistic,
  Card,
  Empty,
  Tabs
} from 'antd';
import {
  FaMoneyCheckAlt,
  FaUniversity,
  FaMoneyBillAlt,
  FaUsers,
  FaBuilding
} from 'react-icons/fa';

import { fetchPayrollSummary } from '@services/SalaryWebService';
import type { CompanyType, PayrollEntry } from '@/types/salaryWebType';

interface Props {
  salaryManagerId: number;
  company: CompanyType;
}

const fmtVND = (v: number | null | undefined) => {
  if (v == null || v === 0) return '—';
  return new Intl.NumberFormat('vi-VN').format(Math.round(v));
};

export default function PayrollTab({ salaryManagerId, company }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['payrollSummary', salaryManagerId, company],
    queryFn: () => fetchPayrollSummary(salaryManagerId, company),
    enabled: !!salaryManagerId
  });

  const transferPayments = data?.transfer_payments || [];
  const cashPayments = data?.cash_payments || [];
  const allPayments = [...transferPayments, ...cashPayments];
  const totals = data?.totals;

  // Tính tổng theo trang
  const buildSummaryRow = (pageData: readonly PayrollEntry[]) => {
    const keys: (keyof PayrollEntry)[] = [
      'total_income',
      'insurance_deduction',
      'union_fee',
      'advance_money',
      'kpi_deduction',
      'previous_debt',
      'actually_received',
      'company_insurance'
    ];
    const sums = keys.reduce(
      (acc, k) => {
        acc[k as string] = pageData.reduce(
          (s, r) => s + ((r[k] as number) || 0),
          0
        );
        return acc;
      },
      {} as Record<string, number>
    );
    return sums;
  };

  // Cột bảng thanh toán lương — khớp sheet "Bảng Lương Thanh Toán"
  const payrollColumns: TableColumnsType<PayrollEntry> = [
    {
      title: <span className="text-xs font-medium text-gray-500">STT</span>,
      width: 50,
      align: 'center',
      render: (_v, _r, i) => (
        <span className="font-mono text-sm text-gray-500">{i + 1}</span>
      )
    },
    {
      title: (
        <span className="text-xs font-semibold text-gray-600">Nhân viên</span>
      ),
      width: 220,
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
            {r.department && (
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] leading-none font-semibold whitespace-nowrap text-gray-500 uppercase">
                {r.department}
              </span>
            )}
          </div>
        </div>
      )
    },
    // Các cột theo đúng thứ tự sheet Excel "Bảng Lương Thanh Toán"
    {
      title: (
        <span className="text-xs font-semibold text-gray-600">
          Tổng thu nhập
        </span>
      ),
      dataIndex: 'total_income',
      width: 145,
      align: 'center',
      render: (v) => (
        <div className="text-center font-mono text-sm font-bold text-indigo-700">
          {fmtVND(v)}
        </div>
      )
    },
    {
      title: (
        <span className="text-xs font-semibold text-gray-600">
          Trừ BHXH NV (10.5%)
        </span>
      ),
      dataIndex: 'insurance_deduction',
      width: 155,
      align: 'center',
      render: (v) => (
        <div className="text-center font-mono text-sm text-red-500">
          {v > 0 ? `-${fmtVND(v)}` : '—'}
        </div>
      )
    },
    {
      title: (
        <span className="text-xs font-semibold text-gray-600">Trừ tạm ứng</span>
      ),
      dataIndex: 'advance_money',
      width: 125,
      align: 'center',
      render: (v) => (
        <div className="text-center font-mono text-sm text-red-500">
          {v > 0 ? `-${fmtVND(v)}` : '—'}
        </div>
      )
    },
    {
      title: (
        <span className="text-xs font-semibold text-gray-600">
          Phí công đoàn (0.5%)
        </span>
      ),
      dataIndex: 'union_fee',
      width: 145,
      align: 'center',
      render: (v) => (
        <div className="text-center font-mono text-sm text-red-400">
          {v > 0 ? `-${fmtVND(v)}` : '—'}
        </div>
      )
    },
    {
      title: (
        <span className="text-xs font-semibold text-gray-600">
          Trừ KPI / Lỗi
        </span>
      ),
      dataIndex: 'kpi_deduction',
      width: 120,
      align: 'center',
      render: (v) => (
        <div
          className={`text-center font-mono text-sm ${v > 0 ? 'font-bold text-red-600' : 'text-gray-300'}`}
        >
          {v > 0 ? `-${fmtVND(v)}` : '—'}
        </div>
      )
    },
    {
      title: (
        <span className="text-xs font-semibold text-gray-600">Nợ kỳ trước</span>
      ),
      dataIndex: 'previous_debt',
      width: 120,
      align: 'center',
      render: (v) => (
        <div
          className={`text-center font-mono text-sm ${v && v > 0 ? 'font-bold text-red-600' : 'text-gray-300'}`}
        >
          {v && v > 0 ? `-${fmtVND(v)}` : '—'}
        </div>
      )
    },
    {
      title: (
        <span className="text-sm font-bold text-emerald-700">THỰC LÃNH</span>
      ),
      dataIndex: 'actually_received',
      width: 155,
      align: 'center',
      fixed: 'right',
      render: (v) => (
        <div className="text-center font-mono text-[15px] font-bold text-emerald-700">
          {fmtVND(v)} ₫
        </div>
      )
    },
    {
      title: (
        <span className="text-xs font-semibold text-gray-600">
          BHXH công ty (21.5%)
        </span>
      ),
      dataIndex: 'company_insurance',
      width: 155,
      align: 'center',
      render: (v) => (
        <div className="text-center font-mono text-sm text-orange-500">
          {fmtVND(v)}
        </div>
      )
    }
  ];

  const buildTable = (tableData: PayrollEntry[], label: string) => {
    const sums = buildSummaryRow(tableData);
    return (
      <Table<PayrollEntry>
        rowKey="employee_id"
        columns={payrollColumns}
        dataSource={tableData}
        loading={isLoading}
        scroll={{ x: 'max-content' }}
        sticky={{ offsetHeader: 64 }}
        pagination={false}
        size="small"
        bordered
        summary={() => (
          <Table.Summary.Row className="!bg-emerald-50/70 text-center font-bold dark:!bg-emerald-900/10">
            <Table.Summary.Cell index={0} colSpan={2} align="center">
              <span className="text-[11px] font-bold text-gray-600">
                Tổng cộng ({tableData.length} {label})
              </span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} align="center">
              <div className="text-center font-mono text-[11px] font-bold text-indigo-700">
                {fmtVND(sums.total_income)}
              </div>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3} align="center">
              <div className="text-center font-mono text-[11px] text-red-500">
                {sums.insurance_deduction > 0
                  ? `-${fmtVND(sums.insurance_deduction)}`
                  : '—'}
              </div>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={4} align="center">
              <div className="text-center font-mono text-[11px] text-red-500">
                {sums.advance_money > 0
                  ? `-${fmtVND(sums.advance_money)}`
                  : '—'}
              </div>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={5} align="center">
              <div className="text-center font-mono text-[11px] text-red-400">
                {sums.union_fee > 0 ? `-${fmtVND(sums.union_fee)}` : '—'}
              </div>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={6} align="center">
              <div className="text-center font-mono text-[11px] text-red-600">
                {sums.kpi_deduction > 0
                  ? `-${fmtVND(sums.kpi_deduction)}`
                  : '—'}
              </div>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={7} align="center">
              <div className="text-center font-mono text-[11px] text-red-600">
                {sums.previous_debt > 0
                  ? `-${fmtVND(sums.previous_debt)}`
                  : '—'}
              </div>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={8} align="center">
              <div className="text-center font-mono text-[13px] font-bold text-emerald-700">
                {fmtVND(sums.actually_received)} ₫
              </div>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={9} align="center">
              <div className="text-center font-mono text-[11px] text-orange-500">
                {fmtVND(sums.company_insurance)}
              </div>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
        className="[&_.ant-table-cell]:!px-3 [&_.ant-table-cell]:!py-2.5 [&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!py-2.5 [&_.ant-table-thead_th]:!text-xs"
      />
    );
  };

  if (!data && !isLoading) {
    return (
      <div className="py-16 text-center">
        <FaMoneyCheckAlt className="mx-auto mb-4 text-5xl text-gray-200" />
        <p className="text-gray-400">Chưa có dữ liệu thanh toán.</p>
        <p className="mt-1 text-sm text-gray-400">
          Vui lòng nhấn{' '}
          <strong className="text-purple-500">"Tính lương tất cả"</strong>{' '}
          trước.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Tổng hợp nhanh */}
      {totals && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card
            size="small"
            className="!rounded-xl !border-blue-100 !bg-gradient-to-br !from-blue-50 !to-white"
          >
            <Statistic
              title={
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <FaUniversity className="text-blue-400" /> Chuyển khoản
                </span>
              }
              value={totals.transfer_total}
              formatter={(v) => fmtVND(Number(v))}
              suffix="₫"
              valueStyle={{ fontSize: 16, fontWeight: 700, color: '#2563eb' }}
            />
            <p className="mt-1 text-xs text-gray-400">
              {totals.transfer_count} người
            </p>
          </Card>
          <Card
            size="small"
            className="!rounded-xl !border-green-100 !bg-gradient-to-br !from-green-50 !to-white"
          >
            <Statistic
              title={
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <FaMoneyBillAlt className="text-green-400" /> Tiền mặt
                </span>
              }
              value={totals.cash_total}
              formatter={(v) => fmtVND(Number(v))}
              suffix="₫"
              valueStyle={{ fontSize: 16, fontWeight: 700, color: '#16a34a' }}
            />
            <p className="mt-1 text-xs text-gray-400">
              {totals.cash_count} người
            </p>
          </Card>
          <Card
            size="small"
            className="!rounded-xl !border-emerald-100 !bg-gradient-to-br !from-emerald-50 !to-white"
          >
            <Statistic
              title={
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <FaMoneyCheckAlt className="text-emerald-400" /> Tổng thực
                  lãnh
                </span>
              }
              value={totals.grand_total}
              formatter={(v) => fmtVND(Number(v))}
              suffix="₫"
              valueStyle={{ fontSize: 16, fontWeight: 700, color: '#059669' }}
            />
          </Card>
          <Card
            size="small"
            className="!rounded-xl !border-gray-100 !bg-gradient-to-br !from-gray-50 !to-white"
          >
            <Statistic
              title={
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <FaUsers className="text-gray-400" /> Tổng nhân viên
                </span>
              }
              value={totals.transfer_count + totals.cash_count}
              suffix="người"
              valueStyle={{ fontSize: 16, fontWeight: 700 }}
            />
          </Card>
        </div>
      )}

      {/* Bảng thanh toán chia theo hình thức */}
      <Tabs
        size="small"
        type="card"
        defaultActiveKey="all"
        items={[
          {
            key: 'all',
            label: (
              <span className="flex items-center gap-1.5">
                <FaBuilding className="text-gray-500" />
                Tất cả
                <Tag color="default" className="!ml-1 !text-[10px]">
                  {allPayments.length}
                </Tag>
              </span>
            ),
            children: buildTable(allPayments, 'nhân viên')
          },
          {
            key: 'transfer',
            label: (
              <span className="flex items-center gap-1.5">
                <FaUniversity className="text-blue-500" />
                Chuyển khoản
                <Tag color="blue" className="!ml-1 !text-[10px]">
                  {transferPayments.length}
                </Tag>
              </span>
            ),
            children:
              transferPayments.length === 0 ? (
                <Empty
                  description="Không có nhân viên nhận lương chuyển khoản"
                  className="py-8"
                />
              ) : (
                buildTable(transferPayments, 'nhân viên chuyển khoản')
              )
          },
          {
            key: 'cash',
            label: (
              <span className="flex items-center gap-1.5">
                <FaMoneyBillAlt className="text-green-500" />
                Tiền mặt
                <Tag color="green" className="!ml-1 !text-[10px]">
                  {cashPayments.length}
                </Tag>
              </span>
            ),
            children:
              cashPayments.length === 0 ? (
                <Empty
                  description="Không có nhân viên nhận lương tiền mặt"
                  className="py-8"
                />
              ) : (
                buildTable(cashPayments, 'nhân viên tiền mặt')
              )
          }
        ]}
      />
    </div>
  );
}
