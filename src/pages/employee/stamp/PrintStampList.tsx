import { QueryParams } from '@/types/queryParams';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { customTableProps } from '@components/custom/TableProps.custom';
import { UserInfo } from '@components/UserInfo';
import {
  fetchEmpStampHistory,
  HistoryPrintStampType
} from '@services/StampService';
import { uiStore } from '@stores/uiStore';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@tanstack/react-store';
import { DatePicker, Spin, Table, TableColumnsType, Tag } from 'antd';
import { TableProps } from 'antd/lib';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';
import { StampDetailCard } from './StampDetailCard';

export const PrintStampList = () => {
  const { isMobile } = useStore(uiStore);

  const [date, setDate] = useState<Dayjs>(dayjs());
  const [params, setParams] = useState<QueryParams>({
    limit: 0,
    include: ['employee', 'manager', 'product'],
    'filter[created_at]': dayjs().format('YYYY-MM-DD')
  });

  const {
    data: historyData,
    isLoading,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['historyPrintStamp', params],
    queryFn: async () => await fetchEmpStampHistory(params)
  });

  const approvedData =
    historyData?.data.filter((item) => item.status === 'approve') || [];

  const rejectedData =
    historyData?.data.filter((item) => item.status === 'rejected') || [];
  const pendingData =
    historyData?.data.filter((item) => item.status === 'pending') || [];

  const columns: TableColumnsType<HistoryPrintStampType> = [
    {
      title: 'STT',
      rowScope: 'row',
      align: 'center',
      render: (_value, _record, index) => index + 1
    },
    {
      title: 'Tên sản phẩm',
      key: 'product_name',
      dataIndex: ['product', 'name']
    },
    {
      title: 'Số Lot',
      key: 'lot_number',
      dataIndex: ['date'],
      render: (value) => {
        return dayjs(value).format('DD-MM-YYYY');
      }
    },
    {
      title: 'Ca',
      key: 'shift',
      dataIndex: 'shift',
      align: 'center'
    },
    {
      title: 'Số lượng in',
      key: 'print_quantity',
      dataIndex: 'binCount',
      align: 'center'
    },
    {
      title: 'Tem bắt đầu',
      key: 'bin_start',
      dataIndex: 'binStart',
      align: 'center'
    },
    {
      title: 'Loại tem',
      key: 'stamp_type',
      dataIndex: 'type',
      render: (value) => {
        if (!value) return '-';
        const typeMap: Record<string, string> = {
          box: 'Tem thùng',
          bag: 'Tem bịch'
        };
        return typeMap[value] || value;
      }
    },
    {
      title: 'Ngày tạo',
      key: 'print_day',
      dataIndex: 'created_at',
      render: (value) => {
        return dayjs(value).format('DD-MM-YYYY');
      }
    },
    {
      title: 'Thời gian tạo',
      key: 'print_time',
      dataIndex: 'created_at',
      render: (value) => {
        return dayjs(value).format('HH:mm:ss');
      }
    },
    {
      title: 'Mã nhân duyệt',
      key: 'manager_id',
      dataIndex: 'manager_id'
    },
    {
      title: 'Tên nhân viên duyệt',
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
      render: (value) => {
        if (value === 'pending') {
          return (
            <Tag color="default" className="font-bold uppercase">
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
              Từ chối
            </Tag>
          );
        }
        return value;
      }
    }
  ];

  const approvedStampTableProps: TableProps<HistoryPrintStampType> = {
    ...(customTableProps as unknown as TableProps<HistoryPrintStampType>),
    rowKey: (record) =>
      [
        'employee',
        'stamp',
        'history',
        record.id,
        record.employee_id,
        record.date
      ].join('-'),
    columns: columns,
    title: () => (
      <div className="bg-green-200 p-2 text-xl font-semibold">Tem đã in</div>
    ),
    dataSource: approvedData,
    loading: isLoading,
    pagination: false
  };

  const rejectedStampTableProps: TableProps<HistoryPrintStampType> = {
    ...(customTableProps as unknown as TableProps<HistoryPrintStampType>),
    rowKey: (record) =>
      [
        'employee',
        'stamp',
        'history',
        record.id,
        record.employee_id,
        record.date
      ].join('-'),
    columns: columns,
    title: () => (
      <div className="bg-red-200 p-2 text-xl font-semibold">Tem bị từ chối</div>
    ),
    dataSource: rejectedData,
    loading: isLoading,
    pagination: false
  };

  const pendingStampTableProps: TableProps<HistoryPrintStampType> = {
    ...(customTableProps as unknown as TableProps<HistoryPrintStampType>),
    rowKey: (record) =>
      [
        'employee',
        'stamp',
        'history',
        record.id,
        record.employee_id,
        record.date
      ].join('-'),
    columns: columns,
    title: () => (
      <div className="bg-gray-200 p-2 text-xl font-semibold">
        Tem đang chờ in
      </div>
    ),
    dataSource: pendingData,
    loading: isLoading,
    pagination: false
  };

  return (
    <>
      <BackButton to="/employee/stamps/request" />
      <ComponentCard title="Bảng Trạng Thái In Tem">
        <UserInfo />
        <div className="flex items-center gap-4">
          <RefreshButton isLoading={isFetching} refresh={refetch} />
          <DatePicker
            value={date}
            onChange={(value) => {
              if (value) {
                setParams((prev) => ({
                  ...prev,
                  'filter[created_at]': dayjs(value).format('YYYY-MM-DD')
                }));
                setDate(dayjs(value));
              } else {
                setParams((prev) => ({
                  ...prev,
                  'filter[created_at]': dayjs().format('YYYY-MM-DD')
                }));
                setDate(dayjs());
              }
            }}
            allowClear
          />
        </div>

        {isMobile ? (
          <div>
            <div className="mb-4 bg-gray-200 p-2 text-xl font-semibold">
              Tem chờ in
            </div>
            <Spin spinning={isLoading}>
              <StampDetailCard data={pendingData} />
            </Spin>
          </div>
        ) : (
          <Table {...pendingStampTableProps} />
        )}
        {isMobile ? (
          <div>
            <div className="mb-4 bg-green-200 p-2 text-xl font-semibold">
              Tem đã in
            </div>
            <Spin spinning={isLoading}>
              <StampDetailCard data={approvedData} />
            </Spin>
          </div>
        ) : (
          <Table {...approvedStampTableProps} />
        )}
        {isMobile ? (
          <div>
            <div className="mb-4 bg-red-200 p-2 text-xl font-semibold">
              Tem bị từ chối
            </div>
            <Spin spinning={isLoading}>
              <StampDetailCard data={rejectedData} />
            </Spin>
          </div>
        ) : (
          <Table {...rejectedStampTableProps} />
        )}
      </ComponentCard>
    </>
  );
};
