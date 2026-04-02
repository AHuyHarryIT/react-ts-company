import { DailyQuantitiesType } from '@/types/dailyQuantitiesType';
import {
  PurchaseOrdersHistoryResponse,
  UpdatePoRequest
} from '@/types/purchaseOrdersType';
import { customFormProps } from '@components/custom/FormProps.custom';
import { customTableProps } from '@components/custom/TableProps.custom';
import { productService } from '@services/ProductService';
import {
  deleteBatchPurchaseOrder,
  deletePurchaseOrder,
  getPurchaseOrdersHistory,
  updatePurchaseOrdersQuantities
} from '@services/PurchaseOrdersService';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  FormProps,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Spin,
  Table,
  TableColumnsType,
  TableProps,
  Tag
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa6';
import { IconHistory } from '@components/icons';

// ── Types ────────────────────────────────────────────────────
interface FormFields {
  date: string;
  [key: `product_${number | string}`]: number;
}

interface PoHistoryModalProps {
  open: boolean;
  onClose: () => void;
}

interface BatchGroup {
  batchId: string;
  date: string;
  fileName: string;
  employeeName: string;
  createdAt: string;
  productCount: number;
  totalQuantity: number;
  records: DailyQuantitiesType[];
}

// ── Component ────────────────────────────────────────────────
export const PoHistoryModal: React.FC<PoHistoryModalProps> = ({
  open,
  onClose
}) => {
  const [form] = Form.useForm<FormFields>();
  const [month, setMonth] = useState<Dayjs>(dayjs());
  const [date, setDate] = useState<Dayjs>();
  const [searchText, setSearchText] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const queryClient = useQueryClient();

  // ── Mutations ──────────────────────────────────────────────
  const { mutate: updatePurchaseOrder, isPending } = useMutation({
    mutationKey: ['updatePurchaseOrder'],
    mutationFn: (data: UpdatePoRequest) => updatePurchaseOrdersQuantities(data),
    onMutate: () => {
      message.loading({
        content: 'Đang cập nhật...',
        key: 'update-po-quantity'
      });
    },
    onSuccess: () => {
      message.success({
        content: 'Cập nhật thành công!',
        key: 'update-po-quantity'
      });
      setDate(undefined);
      queryClient.invalidateQueries({ queryKey: ['purchaseOrdersHistory'] });
    },
    onError: () => {
      message.error({
        content: 'Cập nhật thất bại!',
        key: 'update-po-quantity'
      });
    }
  });

  const { mutate: deleteBatch, isPending: isDeletingBatch } = useMutation({
    mutationKey: ['deleteBatch'],
    mutationFn: (batchId: string) => deleteBatchPurchaseOrder(batchId),
    onMutate: async (batchId) => {
      message.loading({ content: 'Đang xóa...', key: 'delete-batch' });
      await queryClient.cancelQueries({ queryKey: ['purchaseOrdersHistory'] });
      const prev = queryClient.getQueryData<PurchaseOrdersHistoryResponse>([
        'purchaseOrdersHistory',
        month,
        date
      ]);
      if (prev) {
        queryClient.setQueryData<PurchaseOrdersHistoryResponse>(
          ['purchaseOrdersHistory', month, date],
          {
            ...prev,
            dailyQuantitiesPo: prev.dailyQuantitiesPo.filter(
              (item) => item.batch_id !== batchId
            )
          }
        );
      }
      return { prev };
    },
    onSuccess: () => {
      message.success({ content: 'Đã xóa thành công!', key: 'delete-batch' });
      queryClient.invalidateQueries({ queryKey: ['purchaseOrdersHistory'] });
    },
    onError: (_err, _vars, ctx) => {
      message.error({ content: 'Xóa thất bại!', key: 'delete-batch' });
      if (ctx?.prev) {
        queryClient.setQueryData(
          ['purchaseOrdersHistory', month, date],
          ctx.prev
        );
      }
    }
  });

  const { mutate: deleteRecord } = useMutation({
    mutationKey: ['deleteRecord'],
    mutationFn: (id: string) => deletePurchaseOrder(id),
    onMutate: async (id) => {
      message.loading({ content: 'Đang xóa...', key: 'delete-record' });
      await queryClient.cancelQueries({ queryKey: ['purchaseOrdersHistory'] });
      const prev = queryClient.getQueryData<PurchaseOrdersHistoryResponse>([
        'purchaseOrdersHistory',
        month,
        date
      ]);
      if (prev) {
        queryClient.setQueryData<PurchaseOrdersHistoryResponse>(
          ['purchaseOrdersHistory', month, date],
          {
            ...prev,
            dailyQuantitiesPo: prev.dailyQuantitiesPo.filter(
              (item) => item.id !== id
            )
          }
        );
      }
      return { prev };
    },
    onSuccess: () => {
      message.success({ content: 'Đã xóa!', key: 'delete-record' });
      queryClient.invalidateQueries({ queryKey: ['purchaseOrdersHistory'] });
    },
    onError: (_err, _vars, ctx) => {
      message.error({ content: 'Xóa thất bại!', key: 'delete-record' });
      if (ctx?.prev) {
        queryClient.setQueryData(
          ['purchaseOrdersHistory', month, date],
          ctx.prev
        );
      }
    }
  });

  const handleInlineSave = (record: DailyQuantitiesType) => {
    if (editValue === record.quantity) {
      setEditingId(null);
      return;
    }
    updatePurchaseOrder({
      date: record.date,
      products: [{ productId: record.product_id, quantity: editValue }]
    });
    setEditingId(null);
  };

  // ── Queries ────────────────────────────────────────────────
  const { data: purchaseOrdersHistory, isLoading: isLoadingHistory } = useQuery(
    {
      queryKey: ['purchaseOrdersHistory', month, date],
      queryFn: () => getPurchaseOrdersHistory(month.format('YYYY-MM')),
      enabled: open,
      placeholderData: keepPreviousData
    }
  );

  const { data: products, isFetching: isLoadingProducts } = useQuery({
    queryKey: ['purchaseOrdersHistory', date],
    queryFn: () =>
      productService.list({
        limit: 0,
        include: ['dailyQuantitiesPo'],
        date: date?.format('YYYY-MM-DD')
      }),
    enabled: !!date && open,
    placeholderData: keepPreviousData
  });

  const productList = products?.data || [];
  const allHistoryData = purchaseOrdersHistory?.dailyQuantitiesPo || [];

  const filteredHistoryData = allHistoryData.filter((item) =>
    item.product?.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredProductList = productList.filter((product) =>
    product.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  // ── Group records by batch_id ──────────────────────────────
  const batchGroups: BatchGroup[] = useMemo(() => {
    const map = new Map<string, DailyQuantitiesType[]>();

    for (const item of filteredHistoryData) {
      const key = item.batch_id || `no-batch-${item.id}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }

    return [...map.entries()]
      .map(([batchId, records]) => ({
        batchId,
        date: records[0]?.date || '',
        fileName: records[0]?.file_name || '',
        employeeName: records[0]?.employee?.name || '—',
        createdAt: records[0]?.updated_at || records[0]?.created_at || '',
        productCount: records.length,
        totalQuantity: records.reduce((s, r) => s + (r.quantity || 0), 0),
        records
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [filteredHistoryData]);

  // ── Batch table columns ────────────────────────────────────
  const batchColumns: TableColumnsType<BatchGroup> = [
    {
      title: 'STT',
      align: 'center',
      width: 55,
      render: (_, __, index) => (
        <span className="font-mono text-xs text-gray-400">{index + 1}</span>
      )
    },
    {
      title: 'Ngày nhập',
      key: 'date',
      dataIndex: 'date',
      align: 'center',
      width: 120,
      render: (value) => (
        <Tag color="blue" bordered={false}>
          {value}
        </Tag>
      )
    },
    {
      title: 'Tên file',
      key: 'fileName',
      dataIndex: 'fileName',
      ellipsis: true,
      width: 160,
      render: (value: string) =>
        value ? (
          <span className="text-xs text-gray-600 dark:text-gray-300">
            {value}
          </span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )
    },
    {
      title: 'Tổng SP',
      key: 'productCount',
      dataIndex: 'productCount',
      align: 'center',
      width: 85,
      render: (value) => (
        <Tag color="green" bordered={false}>
          {value} SP
        </Tag>
      )
    },
    {
      title: 'Tổng SL',
      key: 'totalQuantity',
      dataIndex: 'totalQuantity',
      align: 'center',
      width: 110,
      render: (value) => (
        <span className="font-semibold text-blue-600">
          {Number(value).toLocaleString('vi-VN')}
        </span>
      )
    },
    {
      title: 'Thời gian',
      key: 'createdAt',
      dataIndex: 'createdAt',
      align: 'center',
      width: 130,
      render: (text) =>
        text ? (
          <div className="text-center leading-tight">
            <div className="text-sm">{dayjs(text).format('DD-MM-YYYY')}</div>
            <div className="text-[11px] text-gray-400">
              {dayjs(text).format('HH:mm:ss')}
            </div>
          </div>
        ) : (
          <span className="text-gray-300">—</span>
        )
    },
    {
      title: 'Người nhập',
      key: 'employee',
      dataIndex: 'employeeName',
      align: 'center',
      width: 150,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {value}
        </span>
      )
    },
    {
      title: '',
      key: 'action',
      align: 'center',
      width: 90,
      render: (_, record) => {
        const hasBatchId =
          record.batchId && !record.batchId.startsWith('no-batch-');
        if (!hasBatchId && record.records.length === 1) {
          return (
            <Popconfirm
              title={`Xóa "${record.records[0].product?.name}"?`}
              onConfirm={(e) => {
                e?.stopPropagation();
                // Single record delete — reuse existing DeleteModel logic inline
                deleteBatch(record.batchId);
              }}
              onCancel={(e) => e?.stopPropagation()}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                size="small"
                type="text"
                danger
                icon={<FaTrash />}
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          );
        }
        if (!hasBatchId) return null;

        return (
          <Popconfirm
            title="Xóa toàn bộ file?"
            description={
              <span className="text-xs">
                {record.productCount} SP · Tổng{' '}
                {Number(record.totalQuantity).toLocaleString('vi-VN')}
              </span>
            }
            onConfirm={(e) => {
              e?.stopPropagation();
              deleteBatch(record.batchId);
            }}
            onCancel={(e) => e?.stopPropagation()}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading: isDeletingBatch }}
          >
            <Button
              size="small"
              type="text"
              danger
              icon={<FaTrash />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        );
      }
    }
  ];

  // ── Batch table props ──────────────────────────────────────
  const batchTableProps: TableProps<BatchGroup> = {
    ...(customTableProps as unknown as TableProps<BatchGroup>),
    columns: batchColumns,
    rowKey: 'batchId',
    dataSource: batchGroups,
    loading: isLoadingHistory,
    onRow: () => ({ style: { cursor: 'pointer' } }),
    expandable: {
      expandRowByClick: true,
      showExpandColumn: false,
      expandedRowRender: (record) => (
        <div className="-mx-2 rounded-lg border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 text-xs tracking-wider text-gray-500 uppercase dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-400">
                <th className="px-4 py-2 text-left" style={{ width: 50 }}>
                  #
                </th>
                <th className="px-4 py-2 text-left">Sản phẩm</th>
                <th className="px-4 py-2 text-right" style={{ width: 140 }}>
                  Số lượng
                </th>
                <th
                  className="px-4 py-2 text-center"
                  style={{ width: 50 }}
                ></th>
              </tr>
            </thead>
            <tbody>
              {record.records.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 transition-colors last:border-0 hover:bg-blue-50/30 dark:border-gray-700/50 dark:hover:bg-blue-900/10"
                >
                  <td className="px-4 py-2 text-xs text-gray-400">{i + 1}</td>
                  <td className="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">
                    {r.product?.name || '—'}
                  </td>
                  <td
                    className="px-4 py-2 text-right"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingId(r.id);
                      setEditValue(r.quantity);
                    }}
                  >
                    {editingId === r.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <InputNumber
                          size="small"
                          min={0}
                          value={editValue}
                          onChange={(v) => setEditValue(v ?? 0)}
                          onPressEnter={(e) => {
                            e.stopPropagation();
                            handleInlineSave(r);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          className="!w-[90px]"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          size="small"
                          type="text"
                          className="!text-green-500"
                          icon={<FaCheck className="text-[10px]" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInlineSave(r);
                          }}
                        />
                        <Button
                          size="small"
                          type="text"
                          className="!text-gray-400"
                          icon={<FaTimes className="text-[10px]" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
                        />
                      </div>
                    ) : (
                      <span
                        className="cursor-pointer rounded px-2 py-0.5 font-semibold text-blue-600 tabular-nums transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Double-click để sửa"
                      >
                        {Number(r.quantity).toLocaleString('vi-VN')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Popconfirm
                      title={`Xóa "${r.product?.name}"?`}
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        deleteRecord(r.id);
                      }}
                      onCancel={(e) => e?.stopPropagation()}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        size="small"
                        type="text"
                        danger
                        icon={<FaTrash className="text-[11px]" />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                <td className="px-4 py-2" />
                <td className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">
                  Tổng cộng
                </td>
                <td className="px-4 py-2 text-right font-bold text-blue-700 tabular-nums">
                  {Number(record.totalQuantity).toLocaleString('vi-VN')}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      ),
      rowExpandable: (record) => record.records.length > 0
    }
  };

  // ── Form props ─────────────────────────────────────────────
  const formProps: FormProps<FormFields> = {
    ...customFormProps,
    form,
    onFinish: async (values) => {
      values.date = date?.format('YYYY-MM-DD') || '';
      const productQuantities = Object.entries(values)
        .filter(([key, val]) => key.startsWith('product_') && val > 0)
        .map(([key, val]) => ({
          productId: key.split('_')[1],
          quantity: val
        }));
      await updatePurchaseOrder({
        date: values.date,
        products: productQuantities
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setDate(undefined);
    setSearchText('');
    onClose();
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-600">
            <IconHistory />
          </span>
          <div>
            <div className="text-base font-semibold">
              Lịch sử nhập sản lượng
            </div>
            <div className="text-xs font-normal text-gray-400">
              Click vào dòng để xem chi tiết sản phẩm
            </div>
          </div>
        </div>
      }
      open={open}
      onClose={handleCancel}
      width="100%"
      destroyOnClose
      styles={{
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }
      }}
    >
      <div className="flex h-full flex-col overflow-hidden">
        {/* ── Sticky Filter Bar ──────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900">
          <DatePicker
            picker="month"
            value={month}
            size="middle"
            className="!rounded-lg"
            placeholder="Chọn tháng"
            onChange={(d) =>
              d ? (setMonth(d), setDate(undefined)) : setMonth(dayjs())
            }
          />
          <Input.Search
            placeholder="Tìm sản phẩm..."
            allowClear
            size="middle"
            className="!max-w-[300px] !rounded-lg"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={(value) => setSearchText(value)}
          />
          {batchGroups.length > 0 && (
            <span className="ml-auto text-xs text-gray-400">
              {batchGroups.length} lần nhập · {filteredHistoryData.length} sản
              phẩm
            </span>
          )}
        </div>

        {/* ── Content ─────────────────────────────────────────── */}
        <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
          {!date ? (
            <Table<BatchGroup> {...batchTableProps} />
          ) : (
            <Spin spinning={isLoadingProducts}>
              <Form<FormFields> {...formProps}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                  {filteredProductList.map((product) => (
                    <Form.Item<FormFields>
                      key={`product_${product.id}_${date?.format('YYYY-MM-DD')}`}
                      label={
                        <div className="font-semibold">{product.name}</div>
                      }
                      name={`product_${product.id}_${date?.format('YYYY-MM-DD')}`}
                      initialValue={product.daily_quantities_po?.[0]?.quantity}
                      rules={[
                        {
                          type: 'number',
                          min: 0,
                          message: 'Số lượng phải lớn hơn hoặc bằng 0'
                        }
                      ]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="Nhập số lượng"
                      />
                    </Form.Item>
                  ))}
                </div>
                {filteredProductList.length > 0 && (
                  <Form.Item>
                    <Button
                      variant="solid"
                      color="blue"
                      loading={isPending}
                      htmlType="submit"
                    >
                      Cập nhật
                    </Button>
                  </Form.Item>
                )}
              </Form>
            </Spin>
          )}
        </div>
      </div>
    </Drawer>
  );
};
