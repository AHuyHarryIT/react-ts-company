import { StorageType } from '@/types/storageType';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { customTableProps } from '@components/custom/TableProps.custom';
import { fetchStorage, StorageParams } from '@services/ScanService';
import { useQuery } from '@tanstack/react-query';
import { Select, Table, TableColumnsType, TableProps } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { FindLotModal } from './FindLotModal';

type TableType = StorageType;

export const Storage = () => {
  const [params, setParams] = useState<StorageParams>({});

  const { data: storageData, isLoading } = useQuery({
    queryKey: ['storage', params],
    queryFn: async () => {
      const response = await fetchStorage(params);
      return response;
    }
  });

  const productOptions = storageData?.products?.map((item) => ({
    label: item.name,
    value: item.id
  }));

  const employeeOptions = storageData?.employees?.map((item) => ({
    label: item.name,
    value: item.id
  }));

  const monthOptions = storageData?.availableMonths?.map((item) => ({
    label: item,
    value: item
  }));

  const dateOptions = storageData?.availableDates?.map((item) => ({
    label: item,
    value: item
  }));

  const columns: TableColumnsType<TableType> = [
    {
      title: 'STT',
      rowScope: 'row',
      align: 'center',
      render: (_value, _record, index) => index + 1
    },
    {
      title: 'Tên sản phẩm',
      key: 'productName',
      dataIndex: ['product', 'name']
    },
    {
      title: 'Code',
      key: 'productCode',
      dataIndex: ['product', 'code']
    },
    {
      title: 'Nhân viên nhập',
      key: 'employeeName',
      dataIndex: ['employee', 'name']
    },
    {
      title: 'Mã nhân viên',
      key: 'employeeCode',
      dataIndex: ['employee', 'id']
    },
    {
      title: 'Số LOT',
      key: 'lotNumber',
      dataIndex: 'lot'
    },
    {
      title: 'Thùng số',
      key: 'boxNumber',
      align: 'center',
      dataIndex: 'bin'
    },
    {
      title: 'Thời gian',
      key: 'time',
      dataIndex: 'created_at',
      render: (value) => dayjs(value).format('HH:mm:ss')
    },
    {
      title: 'Ngày xuất',
      key: 'exportDate',
      dataIndex: 'created_at',
      render: (value) => dayjs(value).format('DD-MM-YYYY')
    }
  ];

  const tableProps: TableProps<TableType> = {
    ...(customTableProps as unknown as TableProps<TableType>),
    rowKey: (record) =>
      ['storage', record.id, record.product_id, record.employee_id].join('-'),
    columns: columns,
    loading: isLoading,
    pagination: false
  };

  return (
    <>
      <BackButton to="/" />
      <ComponentCard title={`Kho đã xuất hàng `}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="product-select">Sản phẩm</label>
            <Select
              id="product-select"
              placeholder="Chọn sản phẩm"
              options={productOptions}
              allowClear
              showSearch
              onChange={(value) => {
                setParams((prev) => ({ ...prev, product_id: value }));
              }}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="employee-select">Nhân viên</label>
            <Select
              id="employee-select"
              placeholder="Chọn nhân viên"
              options={employeeOptions}
              allowClear
              showSearch
              onChange={(value) => {
                setParams((prev) => ({ ...prev, employee_id: value }));
              }}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="month-select">Tháng</label>
            <Select
              id="month-select"
              placeholder="Chọn tháng"
              options={monthOptions}
              allowClear
              showSearch
              onChange={(value) => {
                setParams((prev) => ({ ...prev, filter_month: value }));
              }}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="day-select">Ngày</label>
            <Select
              id="day-select"
              placeholder="Chọn ngày"
              options={dateOptions}
              allowClear
              showSearch
              onChange={(value) => {
                setParams((prev) => ({ ...prev, filter_date: value }));
              }}
            />
          </div>
        </div>
        <FindLotModal productOptions={productOptions} />
        {storageData?.storage ? (
          Object.keys(storageData?.storage).map((key) => (
            <Table<TableType>
              key={key}
              {...tableProps}
              dataSource={storageData.storage[key]}
            />
          ))
        ) : (
          <Table<TableType> {...tableProps} dataSource={[]} />
        )}
      </ComponentCard>
    </>
  );
};
