import React from 'react';
import { Tag } from 'antd';

export interface SalaryTableType {
  key?: string | number;
  description: string;
  hours: number;
  amount: number;
  note: string | null;
  meta?: string | null;
}

interface SalaryTableProps {
  data: SalaryTableType[];
  variant?: 'income' | 'deduction';
}

const formatNumber = (value: number) =>
  value
    ? value.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
    : '-';

const formatCurrency = (value: number) =>
  value ? value.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '-';

const isMeaningfulNote = (note: string | null) => {
  if (!note) return false;
  return note.trim() !== '';
};

const normalizeNote = (note: string | null) => {
  if (!note) return '';
  const trimmed = note.trim();
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed).toLocaleString('en-US', {
      maximumFractionDigits: 2
    });
  }
  return trimmed;
};

export const SalaryTable: React.FC<SalaryTableProps> = ({
  data,
  variant = 'income'
}) => {
  const isIncome = variant === 'income';
  const amountColor = isIncome ? 'text-emerald-600' : 'text-red-600';

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {data.map((item, index) => {
        const isTotal =
          item.key === 'totalIncome' ||
          item.key === 'total_income' ||
          item.key === 'totalReduction' ||
          item.description === 'Tổng thu nhập' ||
          item.description === 'Tổng trừ';

        return (
          <div
            key={item.key ?? item.description}
            className={`flex flex-col gap-1 py-3 first:pt-0 last:pb-0 ${
              isTotal
                ? 'border-t-2 border-gray-300 bg-gray-50/50 pt-3 dark:border-gray-600 dark:bg-gray-800/30'
                : ''
            }`}
          >
            {/* Row: Description + Amount */}
            <div className="flex items-start justify-between gap-2">
              <span
                className={`text-sm ${
                  isTotal
                    ? 'font-bold text-gray-900 dark:text-white'
                    : 'font-medium text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="mr-1.5 inline-block min-w-[18px] text-center font-mono text-xs text-gray-400">
                  {isTotal ? '' : `${index + 1}.`}
                </span>
                {item.description}
              </span>
              <span
                className={`flex-shrink-0 text-right text-sm font-semibold ${
                  isTotal ? `${amountColor} text-base` : amountColor
                }`}
              >
                {formatCurrency(item.amount)}
              </span>
            </div>

            {/* Row: Secondary info with explicit labels to avoid ambiguity */}
            {(item.meta || item.hours || isMeaningfulNote(item.note)) && (
              <div className="mt-0.5 ml-6 flex flex-wrap items-center gap-2">
                {item.meta ? (
                  <Tag className="!m-0 !text-xs" color="blue">
                    Định lượng: {item.meta}
                  </Tag>
                ) : item.hours ? (
                  <Tag className="!m-0 !text-xs" color="blue">
                    Số giờ/ngày: {formatNumber(item.hours)}
                  </Tag>
                ) : null}
                {isMeaningfulNote(item.note) ? (
                  <Tag className="!m-0 !text-xs" color="default">
                    Ghi chú: {normalizeNote(item.note)}
                  </Tag>
                ) : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
