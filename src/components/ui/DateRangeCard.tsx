import { Card } from 'antd';
import React from 'react';
import type { Dayjs } from 'dayjs';

interface DateRangeCardProps {
  title: string;
  startDate: Dayjs;
  endDate?: Dayjs;
}

export const DateRangeCard: React.FC<DateRangeCardProps> = ({
  title,
  startDate,
  endDate
}) => {
  return (
    <Card title={title}>
      <div className="flex items-center justify-between">
        <div>
          <strong>Bắt đầu</strong>
          <p>{startDate.format('DD-MM-YYYY')}</p>
        </div>
        {endDate && (
          <div>
            <strong>Kết thúc</strong>
            <p>{endDate.format('DD-MM-YYYY')}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
