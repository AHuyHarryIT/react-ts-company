import { ProductHistoryStatusType } from '@/types/productType';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { customTableProps } from '@components/custom/TableProps.custom';
import { Route } from '@routes/_authenticated/admin/products/$id';
import { fetchProductHistoryDetail } from '@services/ProductService';
import { useQuery } from '@tanstack/react-query';
import {
  DatePicker,
  Table,
  TableColumnsType,
  TableProps,
  Tabs,
  TabsProps
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';
import { DeleteModal, EditModal } from './ActionModal';
import { UpdateQuantityModal } from './UpdateQuantityModal';

export const ProductDetail = () => {
  const { id } = Route.useParams();
  const [selectTab, setSelectTab] = useState<string>('status1');
  const [month, setMonth] = useState<Dayjs>(dayjs());

  const { data: productHistoryDetail } = useQuery({
    queryKey: ['productDetail', id, month],
    queryFn: async () => {
      return await fetchProductHistoryDetail(id, month.format('MM-YYYY'));
    }
  });

  const dataSourceMap: { [key: string]: ProductHistoryStatusType[] } = {
    status1: productHistoryDetail?.status1 ?? [],
    status2: productHistoryDetail?.status2 ?? [],
    status3: productHistoryDetail?.status3 ?? [],
    status6: productHistoryDetail?.status6 ?? []
  };

  const tableColumns: TableColumnsType<ProductHistoryStatusType> = [
    {
      title: 'STT',
      align: 'center',
      render: (_value, _record, index) => index + 1
    },
    {
      title: 'Tên nhân viên',
      key: 'employeeName',
      dataIndex: ['employee', 'name']
    },
    {
      title: 'Mã nhân viên',
      align: 'center',
      key: 'employeeCode',
      dataIndex: ['employee', 'id']
    },
    {
      title: 'Thời gian cập nhật',
      align: 'center',
      key: 'date',
      dataIndex: ['date'],
      render: (value) => dayjs(value).format('YYYY-MM-DD')
    },
    {
      title: 'Thời gian cuối cùng cập nhật',
      key: 'lastUpdate',
      align: 'center',
      dataIndex: ['updated_at'],
      render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: 'Số lượng',
      align: 'center',
      key: 'quantity',
      dataIndex: ['quantity'],
      render: (value) => {
        if (!value) return '-';
        return (value || 0).toLocaleString();
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_value, record, index) => (
        <div className="flex justify-center gap-2">
          <EditModal
            id={record.id}
            quantity={record.quantity}
            productId={productHistoryDetail?.product.id ?? ''}
            status={record.status}
          />
          <DeleteModal
            id={record.id}
            description={
              <p>
                Hành động không thể khôi phục!!
                <br />
                Bạn có chắc muốn xoá lịch sử cập{' '}
                <strong>
                  #{index + 1} - {record.employee.name} (
                  {dayjs(record.updated_at).format('YYYY-MM-DD HH:mm:ss')})
                </strong>{' '}
                nhật sản phẩm không?
              </p>
            }
          />
        </div>
      )
    }
  ];

  const tableProps: TableProps<ProductHistoryStatusType> = {
    ...(customTableProps as unknown as TableProps<ProductHistoryStatusType>),
    rowKey: (record) => [record['employee'].id, record.id].join('-'),
    dataSource: dataSourceMap[selectTab],
    columns: tableColumns,
    pagination: {
      ...customTableProps.pagination
    }
  };

  const productTabs: TabsProps['items'] = [
    {
      key: 'status1',
      label: 'Lịch sử sản xuất (100%)',
      children: <Table {...tableProps} />
    },
    {
      key: 'status2',
      label: 'Lịch sử hàng kiểm (200%)',
      children: <Table {...tableProps} />
    },
    {
      key: 'status3',
      label: 'Lịch sử xuất hàng (200%)',
      children: <Table {...tableProps} />
    },
    {
      key: 'status6',
      label: 'Lịch sử hàng lỗi',
      children: <Table {...tableProps} />
    }
  ];
  return (
    <>
      <BackButton to="/admin/products" />
      <ComponentCard title="Danh Sách Lịch Sử Cập Nhật Sản Phẩm">
        <div className="text-lg">
          <div>
            <span className="font-semibold">Tên sản phẩm: </span>
            {productHistoryDetail?.product.name ?? 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Mã sản phẩm: </span>
            {productHistoryDetail?.product.code ?? 'N/A'}
          </div>
        </div>
        {productHistoryDetail?.product && (
          <UpdateQuantityModal product={productHistoryDetail.product} />
        )}
        <div>
          <DatePicker
            value={month}
            picker="month"
            onChange={(date) => (date ? setMonth(date) : setMonth(dayjs()))}
          />
        </div>

        <Tabs
          items={productTabs}
          type="card"
          onChange={(setKey) => setSelectTab(setKey)}
        />
      </ComponentCard>
    </>
  );
};
