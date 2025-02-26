import { WorkCalendarTableType } from '@/types/dashboardType';
import { Table, TableProps } from 'antd';
import React from 'react';

interface WorkCalendarTableProps {
  data: WorkCalendarTableType[];
}

const columns: TableProps<WorkCalendarTableType>['columns'] = [
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
    title: 'Ngày bắt đầu',
    dataIndex: 'date',
    render: (value) =>
      new Date(value).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
  },
];

export const WorkCalendarTable: React.FC<WorkCalendarTableProps> = ({
  data,
}: WorkCalendarTableProps) => {
  data.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const dataTable: WorkCalendarTableType[] = data;

  return (
    <Table<WorkCalendarTableType>
      rowKey={(record) => 'workCal-' + record.id}
      columns={columns}
      dataSource={dataTable}
      size="small"
      bordered
      pagination={false}
      scroll={{ x: 425 }}
    />
  );
};
