import { useDailyScheduleUpdateFields } from '@/configs/dailyScheduleForm.config';
import { ConfirmButton } from '@components/ui/CRUD/ConfirmButton';
import { UpdateModal } from '@components/ui/CRUD/UpdateModal';
import { productStatusOptions } from '@constants/productStatus.enum';
import { dailyScheduleSchema } from '@schemas/dailyScheduleSchema.schema';
import { empDailyScheduleService } from '@services/DailyScheduleService';
import { Card, Tag } from 'antd';
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

const gridStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem'
};

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
    <Card>
      <Card.Grid hoverable={false} style={gridStyle}>
        <strong>Tên sản phẩm</strong> <span>{productName}</span>
      </Card.Grid>
      <Card.Grid hoverable={false} style={gridStyle}>
        <strong>Ca làm việc</strong> <span>{shift}</span>
      </Card.Grid>
      <Card.Grid hoverable={false} style={gridStyle}>
        <strong>Ngày nhập</strong> <span>{startDate}</span>
      </Card.Grid>
      {quantities?.map((item, index) => (
        <React.Fragment key={item.type + '-' + item.time + '-' + index}>
          <Card.Grid
            hoverable={false}
            style={{ ...gridStyle, width: '33.3333%', flexDirection: 'column' }}
          >
            <strong>Loại</strong>
            <span className="text-center">
              {productStatusOptions.find((opt) => opt.value === item.type)
                ?.label || 'Chưa xác định'}
            </span>
          </Card.Grid>
          <Card.Grid
            hoverable={false}
            style={{ ...gridStyle, width: '33.3333%', flexDirection: 'column' }}
          >
            <strong>Số lượng</strong>{' '}
            <span className="text-center">{item.quantity}</span>
          </Card.Grid>
          <Card.Grid
            hoverable={false}
            style={{ ...gridStyle, width: '33.3333%', flexDirection: 'column' }}
          >
            <strong>Thời gian</strong>{' '}
            <span className="text-center">{item.time}</span>
          </Card.Grid>
        </React.Fragment>
      ))}

      <Card.Grid hoverable={false} style={gridStyle}>
        <strong>Trạng thái</strong>
        <span>
          {isStatus ? (
            <Tag color="green-inverse" className="font-bold uppercase">
              Đã nhập
            </Tag>
          ) : (
            <Tag color="red-inverse" className="font-bold uppercase">
              Chưa nhập
            </Tag>
          )}
        </span>
      </Card.Grid>
      <Card.Grid hoverable={false} style={gridStyle}>
        <strong>Hành động</strong>
        <div className="space-x-2">
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
      </Card.Grid>
    </Card>
  );
};
