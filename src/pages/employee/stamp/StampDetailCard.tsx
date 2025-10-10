import { HistoryPrintStampType } from '@services/StampService';
import { Card, Empty, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

interface StampDetailCardProps {
  data: HistoryPrintStampType[];
}

const gridStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.5rem 1rem'
};

export const StampDetailCard: React.FC<StampDetailCardProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {data.length > 0 ? (
        data.map((item, index) => (
          <Card key={item.id}>
            <Card.Grid hoverable={false} style={gridStyle}>
              <div className="font-bold">STT</div>
              <div>{index + 1}</div>
            </Card.Grid>
            <Card.Grid hoverable={false} style={gridStyle}>
              <div className="font-bold">Sản phẩm</div>
              <div>{item.product.name}</div>
            </Card.Grid>
            <Card.Grid hoverable={false} style={gridStyle}>
              <div className="font-bold">Ngày</div>
              <div>{dayjs(item.date).format('DD/MM/YYYY')}</div>
            </Card.Grid>
            <Card.Grid hoverable={false} style={gridStyle}>
              <div className="font-bold">Ca làm</div>
              <div>{item.shift}</div>
            </Card.Grid>
            <Card.Grid hoverable={false} style={gridStyle}>
              <div className="font-bold">Số lượng in</div>
              <div>{item.binCount}</div>
            </Card.Grid>
            <Card.Grid hoverable={false} style={gridStyle}>
              <div className="font-bold">Tem bắt đầu</div>
              <div>{item.binStart}</div>
            </Card.Grid>
            <Card.Grid hoverable={false} style={gridStyle}>
              <div className="font-bold">Loại tem</div>
              <div>
                {{
                  box: 'Tem thùng',
                  bag: 'Tem bịch'
                }[item.type] ||
                  item.type ||
                  '-'}
              </div>
            </Card.Grid>
            <Card.Grid hoverable={false} style={gridStyle}>
              <div className="font-bold">Mục đích in</div>
              <div>
                {{
                  new: 'In mới',
                  additional: 'In thêm',
                  reprint: 'In lại'
                }[item.purpose as string] ||
                  item.purpose ||
                  '-'}
              </div>
            </Card.Grid>
            <Card.Grid hoverable={false} style={gridStyle}>
              <div className="font-bold">Ngày tạo</div>
              <div>{dayjs(item.created_at).format('DD/MM/YYYY')}</div>
            </Card.Grid>
            <Card.Grid hoverable={false} style={gridStyle}>
              <div className="font-bold">Mã nhân viên duyệt</div>
              <div>{item.manager?.id ?? '-'}</div>
            </Card.Grid>
            <Card.Grid hoverable={false} style={gridStyle}>
              <div>
                <div className="font-bold">Tên nhân viên duyệt</div>
                <div>{item.manager?.name ?? '-'}</div>
              </div>
            </Card.Grid>
            <Card.Grid hoverable={false} style={gridStyle}>
              <div className="font-bold">Thời gian duyệt</div>
              <div>
                {item.manager_time
                  ? dayjs(item.manager_time, 'HH:mm:ss').format('HH:mm:ss')
                  : '-'}
              </div>
            </Card.Grid>
            <Card.Grid hoverable={false} style={gridStyle}>
              <div className="font-bold">Trạng thái</div>
              <div>
                {item.status === 'pending' && (
                  <Tag color="default" className="font-bold uppercase">
                    Chờ in
                  </Tag>
                )}
                {item.status === 'approve' && (
                  <Tag color="green-inverse" className="font-bold uppercase">
                    Đã in
                  </Tag>
                )}
                {item.status === 'rejected' && (
                  <Tag color="red-inverse" className="font-bold uppercase">
                    Đã hủy
                  </Tag>
                )}
              </div>
            </Card.Grid>
          </Card>
        ))
      ) : (
        <Empty />
      )}
    </div>
  );
};
