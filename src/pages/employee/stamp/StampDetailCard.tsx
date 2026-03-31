import { HistoryPrintStampType } from '@services/StampService';
import { Empty, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

interface StampDetailCardProps {
  data: HistoryPrintStampType[];
}

const renderBinRange = (
  start: string | number | undefined,
  count: number | undefined
) => {
  if (!start) return '-';
  const startStr = String(start);
  if (startStr.includes(',')) {
    return startStr;
  }
  const startNum = Number(startStr);
  const countNum = Number(count || 1);
  if (!isNaN(startNum) && !isNaN(countNum) && countNum > 1) {
    return `${startNum} → ${startNum + countNum - 1}`;
  }
  return startStr;
};

export const StampDetailCard: React.FC<StampDetailCardProps> = ({ data }) => {
  return (
    <div className="flex flex-col gap-3">
      {data.length > 0 ? (
        data.map((item, index) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Header: Product name + Status */}
            <div className="flex items-start justify-between gap-2 border-b border-gray-100 bg-gray-50/50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-[10px] font-medium text-gray-400">
                    #{index + 1}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {item.product?.name || 'Chưa xác định'}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                  <span>{dayjs(item.date).format('DD-MM-YYYY')}</span>
                  <Tag
                    color={item.shift === 1 ? 'blue' : 'purple'}
                    className="!m-0 !text-[11px]"
                  >
                    Ca {item.shift}
                  </Tag>
                </div>
              </div>
              <div className="shrink-0">
                {item.status === 'pending' && (
                  <Tag
                    color="default"
                    className="!m-0 !text-[11px] font-bold uppercase"
                  >
                    Chờ in
                  </Tag>
                )}
                {item.status === 'approve' && (
                  <Tag
                    color="green-inverse"
                    className="!m-0 !text-[11px] font-bold uppercase"
                  >
                    Đã in
                  </Tag>
                )}
                {item.status === 'rejected' && (
                  <Tag
                    color="red-inverse"
                    className="!m-0 !text-[11px] font-bold uppercase"
                  >
                    Từ chối
                  </Tag>
                )}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-y-2 p-3 text-sm">
              <div className="flex flex-col pr-2">
                <span className="mb-0.5 text-xs text-gray-400">
                  Số lượng in
                </span>
                <span className="font-semibold text-blue-600">
                  {item.binCount} thùng
                </span>
                {item.binStart && (
                  <span className="mt-0.5 text-[11px] text-gray-500">
                    Tem từ:{' '}
                    <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                      {renderBinRange(item.binStart, item.binCount)}
                    </span>
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <span className="mb-0.5 text-xs text-gray-400">
                  Loại / Mục đích
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {item.type === 'box'
                      ? 'Thùng'
                      : item.type === 'bag'
                        ? 'Bịch'
                        : item.type}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {item.purpose === 'new'
                      ? 'In mới'
                      : item.purpose === 'additional'
                        ? 'In thêm'
                        : item.purpose === 'reprint'
                          ? 'In lại'
                          : item.purpose}
                  </span>
                </div>
              </div>

              <div className="col-span-2 mt-1 flex flex-col">
                <span className="mb-0.5 text-xs text-gray-400">
                  Thời gian tạo
                </span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {dayjs(item.created_at).format('DD/MM/YYYY HH:mm:ss')}
                </span>
              </div>
            </div>

            {/* Approver info (if any) */}
            {(item.manager_id ||
              item.manager_time ||
              item.status !== 'pending') && (
              <div className="border-t border-gray-100 bg-gray-50/50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/30">
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between gap-4">
                    <span className="shrink-0 text-gray-400">Người duyệt:</span>
                    <span className="truncate font-medium text-gray-700 dark:text-gray-300">
                      {item.manager?.name || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="shrink-0 text-gray-400">
                      Thời gian duyệt:
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.manager_time && item.manager_time !== '-'
                        ? dayjs(item.manager_time, 'HH:mm:ss').format(
                            'HH:mm:ss'
                          )
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <Empty description="Không có dữ liệu" />
      )}
    </div>
  );
};
