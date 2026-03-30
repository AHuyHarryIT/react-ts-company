import { QueryParams } from '@/types/queryParams';
import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { customTableProps } from '@components/custom/TableProps.custom';
import { IconPrint } from '@components/icons';
import {
  getStampHistory,
  HistoryPrintStampType,
  checkDuplicateStamps
} from '@services/StampService';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { Route } from '@routes/_authenticated/stamps/history';
import {
  Button,
  DatePicker,
  Modal,
  Select,
  Table,
  TableColumnsType,
  TableProps,
  Tag
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from 'react';
import {
  FaCalendarAlt,
  FaClock,
  FaExchangeAlt,
  FaCheckCircle
} from 'react-icons/fa';
import { PrintBagStamp } from '@components/print/PrintBagStamp';
import { PrintBoxStamp } from '@components/print/PrintBoxStamp';
import { RejectModal } from './RejectModal';

export default function HistoryPrintStamp() {
  const [lotDate, setLotDate] = useState<Dayjs | null>(null);
  const [createdDate, setCreatedDate] = useState<Dayjs | null>(dayjs());
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 50,
    include: ['employee', 'manager', 'product'],
    'filter[created_at]': dayjs().format('YYYY-MM-DD')
  });
  const [selectedRecord, setSelectedRecord] =
    useState<HistoryPrintStampType | null>(null);
  const printPreviewRef = useRef<HTMLDivElement>(null);

  // Get search params để highlight dòng cụ thể
  const { highlightId } = Route.useSearch();

  const queryResult = useQuery({
    queryKey: ['historyPrintStamp', params],
    queryFn: async () => await getStampHistory(params),
    placeholderData: keepPreviousData
  });

  const { data: response } = queryResult;

  const dataSource = response?.data;
  const pagination = {
    current: response?.current_page,
    total: response?.total,
    pageSize: response?.per_page
  };

  // Mutation to check duplicate stamps
  const { mutate: checkDuplicate } = useMutation({
    mutationKey: ['checkDuplicateStamps'],
    mutationFn: checkDuplicateStamps,
    onSuccess: (data, variables) => {
      const record = variables.record;
      if (!record) return;

      if (data.isDuplicate && data.duplicates && data.duplicates.length > 0) {
        const duplicateInfo = data.duplicates
          .map(
            (dup: { overlappingStamps: number[] }) =>
              `Tem số: ${dup.overlappingStamps.join(', ')}`
          )
          .join('\n');

        Modal.confirm({
          title: 'Cảnh báo: Phát hiện tem trùng lặp',
          content: (
            <div>
              <pre className="mt-2 rounded border border-yellow-200 bg-yellow-50 p-2 text-sm">
                {duplicateInfo}
              </pre>
              <p className="mt-2 font-semibold text-red-600">
                Bạn có chắc chắn muốn tiếp tục in các tem này không?
              </p>
            </div>
          ),
          okText: 'Tiếp tục in',
          cancelText: 'Hủy',
          okButtonProps: { danger: true },
          onOk: () => {
            setSelectedRecord(record);
            setTimeout(() => {
              printPreviewRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }, 100);
          }
        });
      } else {
        setSelectedRecord(record);
        setTimeout(() => {
          printPreviewRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    },
    onError: (error) => {
      console.error('Error checking duplicates:', error);
      Modal.error({
        title: 'Lỗi',
        content: 'Lỗi khi kiểm tra tem trùng lặp. Vui lòng thử lại.'
      });
    }
  });

  // Function to handle print button click
  const handlePrintClick = (record: HistoryPrintStampType) => {
    if (
      !record.product_id ||
      !record.date ||
      !record.shift ||
      !record.binStart ||
      !record.binCount ||
      !record.type
    ) {
      Modal.error({
        title: 'Lỗi',
        content: 'Thiếu thông tin cần thiết để kiểm tra tem trùng lặp.'
      });
      return;
    }

    const requestData = {
      product_id: String(record.product_id),
      date: dayjs(record.date).format('YYYY-MM-DD'),
      shift: record.shift,
      binStart: String(record.binStart),
      binCount: Number(record.binCount),
      type: record.type,
      record: record
    };

    checkDuplicate(requestData);
  };

  // Effect để scroll đến dòng được highlight
  useEffect(() => {
    if (highlightId && dataSource) {
      const timer = setTimeout(() => {
        const element = document.querySelector(
          `[data-row-key*="${highlightId}"]`
        );
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [highlightId, dataSource]);

  const columns: TableColumnsType<HistoryPrintStampType> = [
    {
      title: 'STT',
      rowScope: 'row',
      width: 60,
      align: 'center',
      render: (_value, _record, index) => (
        <span className="font-mono text-xs text-gray-500">
          {index + 1 + (params.limit ?? 10) * ((params.page ?? 1) - 1)}
        </span>
      )
    },
    {
      title: 'Tên sản phẩm',
      key: 'product_name',
      dataIndex: ['product', 'name'],
      render: (value) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {value || <span className="text-gray-400 italic">Chưa có</span>}
        </span>
      )
    },
    {
      title: 'NV gửi',
      key: 'name',
      dataIndex: ['employee', 'name'],
      minWidth: 200,
      render: (value) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {value || (
            <span className="text-gray-400 italic">Chưa có thông tin</span>
          )}
        </span>
      )
    },
    {
      title: 'Số Lot',
      key: 'lot_number',
      dataIndex: ['date'],
      minWidth: 100,
      align: 'center',
      render: (value) => (
        <span className="text-sm">{dayjs(value).format('DD-MM-YYYY')}</span>
      )
    },
    {
      title: 'Ca',
      key: 'shift',
      dataIndex: 'shift',
      align: 'center',
      minWidth: 80,
      render: (value) => {
        if (value === 1) return <Tag color="blue">Ca 1</Tag>;
        if (value === 2) return <Tag color="purple">Ca 2</Tag>;
        return <span className="text-gray-300">—</span>;
      }
    },
    {
      title: 'SL in',
      key: 'print_quantity',
      dataIndex: 'binCount',
      align: 'center',
      minWidth: 80,
      render: (value) => (
        <span className="font-semibold text-blue-600">{value}</span>
      )
    },
    {
      title: 'Tem bắt đầu',
      key: 'bin_start',
      dataIndex: 'binStart',
      align: 'center',
      minWidth: 100,
      render: (value) => (
        <Tag color="geekblue" className="!font-mono !text-xs">
          {value}
        </Tag>
      )
    },
    {
      title: 'Loại tem',
      key: 'stamp_type',
      dataIndex: 'type',
      render: (value) => {
        if (value === 'bag') return <Tag color="orange">Tem Bịch</Tag>;
        if (value === 'box') return <Tag color="cyan">Tem Thùng</Tag>;
        return <Tag>{value}</Tag>;
      }
    },
    {
      title: 'Mục đích',
      key: 'purpose',
      dataIndex: 'purpose',
      render: (value) => {
        if (!value) return <span className="text-gray-300">—</span>;
        const purposeMap: Record<string, { label: string; color: string }> = {
          new: { label: 'In mới', color: 'green' },
          additional: { label: 'In thêm', color: 'blue' },
          reprint: { label: 'In lại', color: 'orange' }
        };
        const item = purposeMap[value];
        return item ? (
          <Tag color={item.color}>{item.label}</Tag>
        ) : (
          <Tag>{value}</Tag>
        );
      }
    },
    {
      title: 'Ngày gửi',
      key: 'print_day',
      dataIndex: 'created_at',
      align: 'center',
      render: (value) => (
        <div className="text-center">
          <div className="text-sm">{dayjs(value).format('DD/MM/YYYY')}</div>
          <div className="text-xs text-gray-400">
            {dayjs(value).format('HH:mm:ss')}
          </div>
        </div>
      )
    },
    {
      title: 'NV in',
      key: 'name',
      dataIndex: ['manager', 'name'],
      align: 'center',
      render: (value) => (
        <span className="text-sm">
          {value || <span className="text-gray-300">—</span>}
        </span>
      )
    },
    {
      title: 'Giờ in',
      key: 'manager_time',
      dataIndex: 'manager_time',
      align: 'center',
      render: (value) => {
        if (!value) return <span className="text-gray-300">—</span>;
        return (
          <Tag color="green" className="!text-xs">
            {dayjs(value, 'HH:mm:ss').format('HH:mm:ss')}
          </Tag>
        );
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
            <Button
              color="blue"
              variant="solid"
              icon={<IconPrint />}
              children="IN"
              onClick={() => handlePrintClick(record)}
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
    rowClassName: (record) => {
      return record.id === highlightId
        ? 'bg-yellow-100 border-l-4 border-l-yellow-500 shadow-md'
        : '';
    },
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
      <ComponentCard title="Lịch sử in tem">
        <div className="space-y-5">
          {/* ── Action Bar ── */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">
            <RefreshButton
              isLoading={queryResult.isFetching}
              refresh={queryResult.refetch}
            />
            <div className="ml-auto flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 dark:border-gray-600 dark:bg-gray-800">
              <span className="text-xs text-gray-500">
                {lotDate
                  ? `🏷️ Lot: ${lotDate.format('DD/MM/YYYY')}`
                  : createdDate
                    ? `📅 ${createdDate.format('DD/MM/YYYY')}`
                    : '📅 Tất cả'}
              </span>
            </div>
          </div>

          {/* ── Filter Bar ── */}
          <div className="rounded-xl border border-gray-100 bg-white/80 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  <FaCalendarAlt className="mr-1 inline-block text-blue-500" />
                  Số Lot
                </label>
                <DatePicker
                  placeholder="Chọn Số Lot"
                  format="DD/MM/YYYY"
                  value={lotDate}
                  allowClear
                  className="!rounded-lg"
                  onChange={(value) => {
                    setLotDate(value);
                    const newParams: QueryParams = {
                      page: 1,
                      limit: params.limit || 50,
                      include: ['employee', 'manager', 'product']
                    };

                    if (value) {
                      newParams['filter[date]'] =
                        dayjs(value).format('YYYY-MM-DD');
                      setCreatedDate(null);
                    } else if (createdDate) {
                      newParams['filter[created_at]'] =
                        createdDate.format('YYYY-MM-DD');
                    }

                    if (params['filter[shift]']) {
                      newParams['filter[shift]'] = params['filter[shift]'];
                    }
                    if (params['filter[status]']) {
                      newParams['filter[status]'] = params['filter[status]'];
                    }

                    setParams(newParams);
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  <FaClock className="mr-1 inline-block text-purple-500" />
                  Ngày gửi
                </label>
                <DatePicker
                  placeholder="Chọn ngày gửi"
                  format="DD/MM/YYYY"
                  value={createdDate}
                  allowClear
                  className="!rounded-lg"
                  onChange={(value) => {
                    setCreatedDate(value);
                    const newParams: QueryParams = {
                      page: 1,
                      limit: params.limit || 50,
                      include: ['employee', 'manager', 'product']
                    };

                    if (value) {
                      newParams['filter[created_at]'] =
                        dayjs(value).format('YYYY-MM-DD');
                      setLotDate(null);
                    } else if (lotDate) {
                      newParams['filter[date]'] = lotDate.format('YYYY-MM-DD');
                    }

                    if (params['filter[shift]']) {
                      newParams['filter[shift]'] = params['filter[shift]'];
                    }
                    if (params['filter[status]']) {
                      newParams['filter[status]'] = params['filter[status]'];
                    }

                    setParams(newParams);
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  <FaExchangeAlt className="mr-1 inline-block text-emerald-500" />
                  Ca làm việc
                </label>
                <Select
                  placeholder="Chọn ca"
                  options={[
                    { value: '1', label: 'Ca 1' },
                    { value: '2', label: 'Ca 2' }
                  ]}
                  allowClear
                  className="!rounded-lg"
                  onChange={(value) => {
                    setParams((prev) => ({
                      ...prev,
                      'filter[shift]': value
                    }));
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  <FaCheckCircle className="mr-1 inline-block text-orange-500" />
                  Trạng thái
                </label>
                <Select
                  placeholder="Chọn trạng thái"
                  options={[
                    { value: 'pending', label: 'Chờ in' },
                    { value: 'approve', label: 'Đã in' },
                    { value: 'rejected', label: 'Đã hủy' }
                  ]}
                  allowClear
                  className="!rounded-lg"
                  onChange={(value) => {
                    setParams((prev) => ({
                      ...prev,
                      'filter[status]': value
                    }));
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Table ── */}
          <Table {...tableProps} />
        </div>
      </ComponentCard>

      {/* Print Preview Section */}
      {selectedRecord && (
        <div ref={printPreviewRef} className="mt-8">
          <ComponentCard title="Xem trước khi in">
            <div className="space-y-5">
              {/* Print Info Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 dark:border-gray-700 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    {selectedRecord.product.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Tag color="blue">
                      NV: {selectedRecord.employee?.name || 'Chưa có thông tin'}
                    </Tag>
                    <Tag color="geekblue">
                      {dayjs(selectedRecord.date).format('DD-MM-YYYY')}
                    </Tag>
                    <Tag color="purple">Ca {selectedRecord.shift}</Tag>
                    <Tag color="cyan">SL: {selectedRecord.binCount}</Tag>
                  </div>
                </div>
                <Button
                  color="red"
                  variant="outlined"
                  onClick={() => setSelectedRecord(null)}
                >
                  Đóng
                </Button>
              </div>

              {(selectedRecord.type === 'box' ||
                selectedRecord.type === 'Tem Thùng') && (
                <PrintBoxStamp
                  product={selectedRecord.product}
                  startStamp={selectedRecord.binStart}
                  totalStamp={
                    selectedRecord.binStart &&
                    selectedRecord.binStart.includes(',')
                      ? selectedRecord.binStart
                          .split(',')
                          .filter((item) => item.trim() !== '').length
                      : selectedRecord.binCount
                  }
                  shift={selectedRecord.shift}
                  date={dayjs(selectedRecord.date)}
                  employee_id={selectedRecord.employee_id}
                  stamp_id={selectedRecord.id}
                />
              )}

              {(selectedRecord.type === 'bag' ||
                selectedRecord.type === 'Tem Bịch') && (
                <PrintBagStamp
                  product={selectedRecord.product}
                  startStamp={selectedRecord.binStart}
                  totalStamp={
                    selectedRecord.binStart &&
                    selectedRecord.binStart.includes(',')
                      ? selectedRecord.binStart
                          .split(',')
                          .filter((item) => item.trim() !== '').length
                      : selectedRecord.binCount
                  }
                  shift={selectedRecord.shift}
                  date={dayjs(selectedRecord.date)}
                  employee_id={selectedRecord.employee_id}
                  stamp_id={selectedRecord.id}
                />
              )}
            </div>
          </ComponentCard>
        </div>
      )}
    </>
  );
}
