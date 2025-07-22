import { TableProps } from 'antd';

export const customTableProps: TableProps = {
  bordered: true,
  size: 'small',
  scroll: { x: 'max-content' },
  tableLayout: 'auto',
  pagination: {
    size: 'default',
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100', '200', '500'],
    showTotal: (total, range) => {
      return `Hiển thị ${range[0]}-${range[1]} (Tổng ${total})`;
    },
    position: ['topRight', 'bottomRight']
  }
};
