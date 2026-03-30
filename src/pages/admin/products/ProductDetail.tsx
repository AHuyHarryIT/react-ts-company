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
  TabsProps,
  Tag
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  FaCalendarAlt,
  FaIndustry,
  FaCheckCircle,
  FaTruck,
  FaExclamationTriangle
} from 'react-icons/fa';
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
      width: 60,
      render: (_value, _record, index) => (
        <span className="font-mono text-xs text-gray-500">{index + 1}</span>
      )
    },
    {
      title: 'Tên nhân viên',
      key: 'employeeName',
      dataIndex: ['employee', 'name'],
      render: (value) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {value || (
            <span className="text-gray-400 italic">Chưa có thông tin</span>
          )}
        </span>
      )
    },
    {
      title: 'Mã nhân viên',
      align: 'center',
      key: 'employeeCode',
      dataIndex: ['employee', 'id'],
      render: (value) => (
        <Tag color="blue" className="!font-mono !text-xs">
          {value}
        </Tag>
      )
    },
    {
      title: 'Thời gian cập nhật',
      align: 'center',
      key: 'date',
      dataIndex: ['date'],
      render: (value) => (
        <span className="text-sm">{dayjs(value).format('YYYY-MM-DD')}</span>
      )
    },
    {
      title: 'Lần cuối cập nhật',
      key: 'lastUpdate',
      align: 'center',
      dataIndex: ['updated_at'],
      render: (value) => (
        <span className="text-xs text-gray-500">
          {dayjs(value).format('YYYY-MM-DD HH:mm:ss')}
        </span>
      )
    },
    {
      title: 'Số lượng',
      align: 'center',
      key: 'quantity',
      dataIndex: ['quantity'],
      render: (value) => {
        if (!value) return <span className="text-gray-300">—</span>;
        return (
          <span className="font-semibold text-blue-600">
            {(value || 0).toLocaleString()}
          </span>
        );
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 200,
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
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaIndustry className="text-emerald-500" />
          Sản xuất (100%)
        </span>
      ),
      children: <Table {...tableProps} />
    },
    {
      key: 'status2',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaCheckCircle className="text-cyan-500" />
          Kiểm (200%)
        </span>
      ),
      children: <Table {...tableProps} />
    },
    {
      key: 'status3',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaTruck className="text-amber-500" />
          Xuất hàng (200%)
        </span>
      ),
      children: <Table {...tableProps} />
    },
    {
      key: 'status6',
      label: (
        <span className="flex items-center gap-2 text-sm font-medium">
          <FaExclamationTriangle className="text-red-500" />
          Hàng lỗi
        </span>
      ),
      children: <Table {...tableProps} />
    }
  ];

  return (
    <>
      <BackButton to="/admin/products" />
      <ComponentCard title="Lịch sử cập nhật sản phẩm">
        <div className="space-y-5">
          {/* ── Product Info Header ─────────────────────────────────── */}
          <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 dark:border-gray-700 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {productHistoryDetail?.product.name ?? 'N/A'}
              </h4>
              <div className="flex items-center gap-2">
                <Tag color="blue" className="!font-mono">
                  {productHistoryDetail?.product.code ?? 'N/A'}
                </Tag>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {productHistoryDetail?.product && (
                <UpdateQuantityModal product={productHistoryDetail.product} />
              )}
            </div>
          </div>

          {/* ── Filter Bar ─────────────────────────────────────────── */}
          <div className="rounded-xl border border-gray-100 bg-white/80 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  <FaCalendarAlt className="mr-1 inline-block text-blue-500" />
                  Tháng
                </label>
                <DatePicker
                  value={month}
                  picker="month"
                  className="!rounded-lg"
                  onChange={(date) =>
                    date ? setMonth(date) : setMonth(dayjs())
                  }
                />
              </div>
            </div>
          </div>

          {/* ── Tabs ───────────────────────────────────────────────── */}
          <Tabs
            items={productTabs}
            type="card"
            size="large"
            animated
            onChange={(setKey) => setSelectTab(setKey)}
          />
        </div>
      </ComponentCard>
    </>
  );
};
