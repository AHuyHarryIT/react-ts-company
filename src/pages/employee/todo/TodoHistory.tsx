import ComponentCard from '@components/common/ComponentCard';
import { UserInfo } from '@components/UserInfo';
import { productStatusOptions } from '@constants/productStatus.enum';
import { fetchTodoHistory } from '@services/TodoService';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Button, DatePicker, Empty, Select, Spin } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';
import { BsArrowLeft } from 'react-icons/bs';

export const TodoHistory = () => {
  const [month, setMonth] = useState<Dayjs>(dayjs());
  const [selectProduct, setSelectProduct] = useState<string | undefined>(
    undefined
  );

  const { data: histories, isLoading } = useQuery({
    queryKey: ['product', 'todo', 'history', month, selectProduct],
    queryFn: () =>
      fetchTodoHistory({
        month: month.format('YYYY-MM'),
        productId: selectProduct
      })
  });

  const todoOptions = histories?.products?.map((todo) => ({
    key: todo.id,
    label: todo.name,
    value: todo.id
  }));

  return (
    <>
      <ComponentCard title="Cập Nhật Sản Lượng">
        <div className="flex flex-col items-center gap-4 lg:flex-row">
          <Link to="/employee/todo/add-product">
            <Button variant="solid" color="blue" icon={<BsArrowLeft />}>
              NHẬP SẢN PHẨM
            </Button>
          </Link>
        </div>
        <div className="space-y-6 lg:w-1/2">
          <UserInfo />
          <div className="flex flex-wrap items-center gap-4">
            <DatePicker
              value={month}
              onChange={(date) => setMonth(date)}
              placeholder="Chọn tháng"
              format="YYYY-MM"
              picker="month"
            />
            <Select
              options={todoOptions}
              allowClear
              showSearch
              placeholder="Chọn sản phẩm"
              onChange={(value) => setSelectProduct(value)}
            />
          </div>
          <div>
            <div className="grid grid-cols-3">
              <span>Ngày</span>
              <span>Loại</span>
              <span>Số lượng</span>
            </div>
            <Spin spinning={isLoading}>
              {histories?.data && histories.data.length > 0 ? (
                histories.data.map((history) => (
                  <div key={history.id} className="grid grid-cols-3">
                    <span>{dayjs(history.date).format('DD/MM/YYYY')}</span>
                    <span>
                      {
                        productStatusOptions.find(
                          (item) => item.value === history.status
                        )?.label
                      }
                    </span>
                    <span>{history.quantity}</span>
                  </div>
                ))
              ) : (
                <Empty description="Không có dữ liệu" />
              )}
            </Spin>
          </div>
        </div>
      </ComponentCard>
    </>
  );
};
