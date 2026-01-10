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
import { useMutation, useQuery } from '@tanstack/react-query';
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
    queryFn: async () => await getStampHistory(params)
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
              {/* <p>Các tem sau đã được in trước đó với trạng thái "Đã in" và mục đích "In mới":</p> */}
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
    // Validate required fields
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

    // Prepare request data with proper types
    const requestData = {
      product_id: String(record.product_id), // Ensure string
      date: dayjs(record.date).format('YYYY-MM-DD'), // Ensure correct date format
      shift: record.shift,
      binStart: String(record.binStart), // Ensure string
      binCount: Number(record.binCount), // Ensure number
      type: record.type,
      record: record
    };

    // Check for duplicates first
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
      }, 500); // Delay để đảm bảo table đã render

      return () => clearTimeout(timer);
    }
  }, [highlightId, dataSource]);

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
      align: 'center',
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
      dataIndex: 'type',
      render: (value) => {
        if (value === 'bag') return 'Tem Bịch';
        if (value === 'box') return 'Tem Thùng';
        return value;
      }
    },
    {
      title: 'Mục đích in',
      key: 'purpose',
      dataIndex: 'purpose',
      render: (value) => {
        if (!value) return '-';
        const purposeMap: Record<string, string> = {
          new: 'In mới',
          additional: 'In thêm',
          reprint: 'In lại'
        };
        return purposeMap[value] || value;
      }
    },
    {
      title: 'Ngày gửi',
      key: 'print_day',
      dataIndex: 'created_at',
      align: 'center',
      render: (value) => {
        return dayjs(value).format('DD/MM/YYYY');
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
      title: 'Tên nhân viên in',
      key: 'name',
      dataIndex: ['manager', 'name'],
      align: 'center',
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
      // Highlight dòng nếu record.id trùng với highlightId - màu vàng sáng
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
      <ComponentCard
        title={`Lịch sử in tem${lotDate ? ` - Số Lot: ${lotDate.format('DD/MM/YYYY')}` : createdDate ? ` - ${createdDate.format('DD/MM/YYYY')}` : ''}`}
      >
        <RefreshButton
          isLoading={queryResult.isFetching}
          refresh={queryResult.refetch}
        />
        <section className="flex flex-wrap gap-2">
          <DatePicker
            placeholder="Chọn Số Lot"
            format="DD/MM/YYYY"
            value={lotDate}
            allowClear
            onChange={(value) => {
              setLotDate(value);
              const newParams: QueryParams = {
                page: 1,
                limit: params.limit || 50,
                include: ['employee', 'manager', 'product']
              };

              if (value) {
                // Khi chọn Số Lot, xóa filter created_at
                newParams['filter[date]'] = dayjs(value).format('YYYY-MM-DD');
                setCreatedDate(null);
              } else if (createdDate) {
                // Khi clear Số Lot, giữ lại created_at nếu có
                newParams['filter[created_at]'] =
                  createdDate.format('YYYY-MM-DD');
              }

              // Giữ lại các filter khác (shift, status)
              if (params['filter[shift]']) {
                newParams['filter[shift]'] = params['filter[shift]'];
              }
              if (params['filter[status]']) {
                newParams['filter[status]'] = params['filter[status]'];
              }

              setParams(newParams);
            }}
          />
          <DatePicker
            placeholder="Chọn ngày gửi"
            format="DD/MM/YYYY"
            value={createdDate}
            allowClear
            onChange={(value) => {
              setCreatedDate(value);
              const newParams: QueryParams = {
                page: 1,
                limit: params.limit || 50,
                include: ['employee', 'manager', 'product']
              };

              if (value) {
                // Khi chọn ngày gửi, xóa filter date
                newParams['filter[created_at]'] =
                  dayjs(value).format('YYYY-MM-DD');
                setLotDate(null);
              } else if (lotDate) {
                // Khi clear ngày gửi, giữ lại date nếu có
                newParams['filter[date]'] = lotDate.format('YYYY-MM-DD');
              }

              // Giữ lại các filter khác (shift, status)
              if (params['filter[shift]']) {
                newParams['filter[shift]'] = params['filter[shift]'];
              }
              if (params['filter[status]']) {
                newParams['filter[status]'] = params['filter[status]'];
              }

              setParams(newParams);
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

      {/* Print Preview Section */}
      {selectedRecord && (
        <div ref={printPreviewRef} className="mt-8">
          <ComponentCard title="Xem trước khi in">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Sản phẩm:</strong> {selectedRecord.product.name}
                </p>
                <p>
                  <strong>Nhân viên yêu cầu:</strong>{' '}
                  {selectedRecord.employee?.name || 'Chưa có thông tin'}
                </p>
                <p>
                  <strong>Ngày:</strong>{' '}
                  {dayjs(selectedRecord.date).format('DD-MM-YYYY')}
                </p>
                <p>
                  <strong>Ca:</strong> {selectedRecord.shift}
                </p>
                <p>
                  <strong>Số lượng:</strong> {selectedRecord.binCount}
                </p>
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
          </ComponentCard>
        </div>
      )}
    </>
  );
}
