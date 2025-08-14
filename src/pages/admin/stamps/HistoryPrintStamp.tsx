import { QueryParams } from '@/types/queryParams';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { customTableProps } from '@components/custom/TableProps.custom';
import { IconPrint } from '@components/icons';
import { getStampHistory, HistoryPrintStampType } from '@services/StampService';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  DatePicker,
  Select,
  Table,
  TableColumnsType,
  TableProps,
  Tag
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';
import { PrintStampModal } from './PrintStampModal';
import { RejectModal } from './RejectModal';

export default function HistoryPrintStamp() {
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 50,
    include: ['employee', 'manager', 'product'],
    'filter[created_at]': dayjs().format('YYYY-MM-DD')
  });

  const queryResult = useQuery({
    queryKey: ['historyPrintStamp', params],
    queryFn: async () => await getStampHistory(params)
  });

  const { data: response } = queryResult;

  const dataSource = response?.data;
  const pagination = {
    current: response?.current_page,
    total: response?.total,
    pageSize: response?.per_page
  };

  const columns: TableColumnsType<HistoryPrintStampType> = [
    {
      title: 'STT',
      rowScope: 'row',
      minWidth: 50,
      align: 'center',
      render: (_value, _record, index) =>
        index + 1 + (params.limit ?? 10) * ((params.page ?? 1) - 1)
    },
    {
      title: 'Tên sản phẩm',
      key: 'product_name',
      dataIndex: ['product', 'name']
    },
    {
      title: 'Mã nhân viên gửi',
      key: 'employee_id',
      dataIndex: 'employee_id',
      minWidth: 120
    },
    {
      title: 'Tên nhân viên gửi',
      key: 'name',
      dataIndex: ['employee', 'name'],
      minWidth: 200,
      render: (value) => {
        return value || 'Chưa có thông tin';
      }
    },
    {
      title: 'Số Lot',
      key: 'lot_number',
      dataIndex: ['date'],
      minWidth: 100,
      render: (value) => {
        return dayjs(value).format('DD-MM-YYYY');
      }
    },
    {
      title: 'Ca',
      key: 'shift',
      dataIndex: 'shift',
      align: 'center',
      minWidth: 100
    },
    {
      title: 'Số lượng in',
      key: 'print_quantity',
      dataIndex: 'binCount',
      align: 'center',
      minWidth: 100
    },
    {
      title: 'Bắt đầu từ tem số',
      key: 'bin_start',
      dataIndex: 'binStart',
      align: 'center',
      minWidth: 100
    },
    {
      title: 'Loại tem',
      key: 'stamp_type',
      dataIndex: 'type'
    },
    {
      title: 'Ngày gửi',
      key: 'print_day',
      dataIndex: 'created_at',
      render: (value) => {
        return dayjs(value).format('DD-MM-YYYY');
      }
    },
    {
      title: 'Thời gian gửi',
      key: 'print_time',
      dataIndex: 'created_at',
      render: (value) => {
        return dayjs(value).format('HH:mm:ss');
      }
    },
    {
      title: 'Mã nhân viên in',
      key: 'manager_id',
      dataIndex: 'manager_id'
    },
    {
      title: 'Tên nhân viên in',
      key: 'name',
      dataIndex: ['manager', 'name'],
      render: (value) => {
        return value || '-';
      }
    },
    {
      title: 'Thời gian in',
      key: 'manager_time',
      dataIndex: 'manager_time',
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return dayjs(value, 'HH:mm:ss').format('HH:mm:ss');
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'status',
      align: 'center',
      minWidth: 100,
      render: (value) => {
        if (value === 'pending') {
          return (
            <Tag color="yellow-inverse" className="font-bold uppercase">
              Chờ in
            </Tag>
          );
        }
        if (value === 'approve') {
          return (
            <Tag color="green-inverse" className="font-bold uppercase">
              Đã in
            </Tag>
          );
        }
        if (value === 'rejected') {
          return (
            <Tag color="red-inverse" className="font-bold uppercase">
              Đã hủy
            </Tag>
          );
        }
        return value;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      minWidth: 100,
      render: (_, record) => {
        if (record.status == 'approve' || record.status == 'rejected') {
          return (
            <Button
              disabled
              color="blue"
              variant="solid"
              icon={<IconPrint />}
              children="IN"
            />
          );
        }
        return (
          <div className="flex items-center justify-center gap-2">
            <PrintStampModal
              product={record.product}
              startStamp={record.binStart}
              totalStamp={record.binCount}
              shift={record.shift}
              date={dayjs(record.date)}
              type={record.type as 'box' | 'bag' | 'Tem Thùng' | 'Tem Bịch'}
              employee_id={record.employee_id}
              stamp_id={record.id}
            />
            <RejectModal stampId={record.id} />
          </div>
        );
      }
    }
  ];

  const tableProps: TableProps<HistoryPrintStampType> = {
    ...(customTableProps as unknown as TableProps<HistoryPrintStampType>),
    rowKey: (record) =>
      ['stamp', 'history', record.id, record.employee_id, record.date].join(
        '-'
      ),
    columns: columns,
    dataSource: dataSource,
    loading: queryResult.isLoading,
    pagination: {
      ...customTableProps.pagination,
      current: params.page,
      pageSize: params.limit,
      total: pagination.total,
      onShowSizeChange: (_current, size) => {
        setParams((prev) => ({
          ...prev,
          limit: size
        }));
      },
      onChange: (page) => {
        setParams((prev) => ({
          ...prev,
          page: page
        }));
      }
    }
  };

  return (
    <>
      <ComponentCard title={`LỊch sử in tem - ${date.format('DD-MM-YYYY')}`}>
        <RefreshButton
          isLoading={queryResult.isFetching}
          refresh={queryResult.refetch}
        />
        <section className="flex flex-wrap gap-2">
          <DatePicker
            placeholder="Chọn ngày"
            value={date}
            onChange={(value) => {
              setDate(value ? value : dayjs());
              setParams((prev) => ({
                ...prev,
                'filter[created_at]': value
                  ? value.format('YYYY-MM-DD')
                  : dayjs().format('YYYY-MM-DD')
              }));
            }}
          />
          <Select
            className="min-w-24"
            placeholder="Chọn ca"
            options={[
              { value: '1', label: 'Ca 1' },
              { value: '2', label: 'Ca 2' }
            ]}
            allowClear
            onChange={(value) => {
              setParams((prev) => ({
                ...prev,
                'filter[shift]': value
              }));
            }}
          />
          <Select
            className="min-w-24"
            placeholder="Chọn trạng thái"
            options={[
              { value: 'pending', label: 'Chờ in' },
              { value: 'approve', label: 'Đã in' },
              { value: 'rejected', label: 'Đã hủy' }
            ]}
            allowClear
            onChange={(value) => {
              setParams((prev) => ({
                ...prev,
                'filter[status]': value
              }));
            }}
          />
        </section>

        <Table {...tableProps} />
      </ComponentCard>
    </>
  );
}
