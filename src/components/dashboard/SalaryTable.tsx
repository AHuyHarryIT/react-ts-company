import { SalaryTableType } from '@/types/dashboardType';
import { Table, TableProps } from 'antd';

interface SalaryTableProps {
  data: SalaryTableType[];
}

const columns: TableProps<SalaryTableType>['columns'] = [
  {
    title: 'STT',
    rowScope: 'row',
    render: (_value, _record, index) => index + 1,
  },
  {
    title: 'Tiêu đề',
    dataIndex: 'title',
  },
  {
    title: 'Tổng (VNĐ)',
    dataIndex: 'total',
    render: (value: number) =>
      value.toLocaleString('vi-VN', {
        style: 'decimal',
        currency: 'VND',
      }),
    className: 'text-right',
  },
  {
    title: 'Ngày bắt đầu',
    dataIndex: 'start_date',
    render: (value) =>
      new Date(value).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
  },
  {
    title: 'Ngày kết thúc',
    dataIndex: 'end_date',
    render: (value) =>
      new Date(value).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
  },
];

export const SalaryTable: React.FC<SalaryTableProps> = ({
  data,
}: SalaryTableProps) => {
  const dataTable: SalaryTableType[] = data;

  return (
    <Table<SalaryTableType>
      rowKey={(record) => 'salary-' + record.id}
      columns={columns}
      dataSource={dataTable}
      bordered
      size="small"
      pagination={false}
      scroll={{ x: 768 }}
    />
  );
};
