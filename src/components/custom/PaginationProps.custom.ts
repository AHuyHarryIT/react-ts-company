import { PaginationProps } from 'antd';

export const customPaginationProps: PaginationProps = {
  align: 'end',
  size: 'default',
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100', '200', '500'],
  showTotal: (total, range) =>
    `Hiển thị ${range[0]}-${range[1]} (Tổng ${total})`
};
