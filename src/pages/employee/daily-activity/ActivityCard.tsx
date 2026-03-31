import { useDailyScheduleUpdateFields } from '@/configs/dailyScheduleForm.config';
import { ConfirmButton } from '@components/ui/CRUD/ConfirmButton';
import { UpdateModal } from '@components/ui/CRUD/UpdateModal';
import { productStatusOptions } from '@constants/productStatus.enum';
import { dailyScheduleSchema } from '@schemas/dailyScheduleSchema.schema';
import { empDailyScheduleService } from '@services/DailyScheduleService';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

interface ActivityCardProps {
  id: string;
  productName: string;
  shift: string;
  startDate: string;
  isStatus: boolean;
  quantities?: {
    type: number;
    quantity: number;
    time: string;
  }[];
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  id,
  productName,
  shift,
  startDate,
  isStatus,
  quantities
}) => {
  const dailyScheduleUpdateFields = useDailyScheduleUpdateFields();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Header: Product name + Status */}
      <div className="flex items-start justify-between gap-2 border-b border-gray-100 px-3 py-2.5 dark:border-gray-700">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
            {productName}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span>{startDate}</span>
            <Tag
              color={shift === 'Ca 1' ? 'blue' : 'purple'}
              className="!m-0 !text-[11px]"
            >
              {shift}
            </Tag>
          </div>
        </div>
        <div className="shrink-0">
          {isStatus ? (
            <Tag
              color="green-inverse"
              className="!m-0 !text-[11px] font-bold uppercase"
            >
              Đã nhập
            </Tag>
          ) : (
            <Tag
              color="red-inverse"
              className="!m-0 !text-[11px] font-bold uppercase"
            >
              Chưa nhập
            </Tag>
          )}
        </div>
      </div>

      {/* Quantities list */}
      {quantities && quantities.length > 0 && (
        <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
          {quantities.map((item, index) => {
            const statusLabel =
              productStatusOptions.find((opt) => opt.value === item.type)
                ?.label || 'Chưa xác định';
            const formattedTime = item.time
              ? dayjs(item.time, 'HH:mm:ss').format('HH:mm')
              : '';

            return (
              <div
                key={item.type + '-' + item.time + '-' + index}
                className="flex items-center justify-between gap-2 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <Tag color="geekblue" className="!m-0 !text-[11px]">
                    {statusLabel}
                  </Tag>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-bold text-blue-600">
                    {Number(item.quantity || 0).toLocaleString('vi-VN')}
                  </span>
                  {formattedTime && (
                    <span className="text-[11px] text-gray-400">
                      {formattedTime}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-3 py-2 dark:border-gray-700">
        <UpdateModal
          id={id}
          service={empDailyScheduleService}
          schema={dailyScheduleSchema}
          fields={dailyScheduleUpdateFields}
        />
        <ConfirmButton
          id={id}
          service={empDailyScheduleService}
          content={
            <span>
              Bạn có chắc chắn muốn xóa bản ghi <strong>{id}</strong> không?
            </span>
          }
        />
      </div>
    </div>
  );
};
