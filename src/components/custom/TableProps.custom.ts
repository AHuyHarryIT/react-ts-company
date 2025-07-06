import { TableProps } from 'antd';

export const customTableProps: TableProps = {
  bordered: true,
  size: 'small',
  scroll: { x: 'max-content', y: 'calc(100vh - 300px)' },
  tableLayout: 'auto',
  pagination: {
    size: 'default',
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100', '200', '500'],
    showTotal: (total) => `Tổng ${total} dòng`
  }
};
