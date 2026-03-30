import ComponentCard from '@components/common/ComponentCard';
import { UserInfo } from '@components/UserInfo';
import { productStatusOptions } from '@constants/productStatus.enum';
import { fetchTodoHistory } from '@services/TodoService';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { DatePicker, Empty, Select, Spin, Tag } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';
import { FaCalendarAlt, FaSearch } from 'react-icons/fa';
import { FaClockRotateLeft } from 'react-icons/fa6';

interface TodoOption {
  key: string;
  label: string;
  value: string;
  searchText: string;
}

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

  const todoOptions: TodoOption[] =
    histories?.products?.map((todo) => ({
      key: todo.id,
      label: todo.name,
      value: todo.id,
      searchText: `${todo.code} ${todo.name}`.toLowerCase()
    })) || [];

  return (
    <>
      <ComponentCard
        title={
          <div className="flex items-center gap-3">
            <FaClockRotateLeft className="text-blue-500" />
            <span>Lịch Sử Cập Nhật Sản Lượng</span>
          </div>
        }
      >
        <div className="space-y-5">
          {/* ── Action Bar ─────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">
            <Link to="/employee/todo/add-product">
              <button className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-600 hover:shadow-md active:scale-[0.97]">
                ← NHẬP SẢN PHẨM
              </button>
            </Link>
          </div>

          <div className="space-y-6 lg:w-1/2">
            {/* ── User Info ──────────────────────────────────────── */}
            <UserInfo />

            {/* ── Filter Bar ────────────────────────────────────── */}
            <div className="rounded-xl border border-gray-100 bg-white/80 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    <FaCalendarAlt className="mr-1 inline-block text-blue-500" />
                    Tháng
                  </label>
                  <DatePicker
                    value={month}
                    onChange={(date) => setMonth(date)}
                    placeholder="Chọn tháng"
                    format="YYYY-MM"
                    picker="month"
                    className="!rounded-lg"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    <FaSearch className="mr-1 inline-block text-emerald-500" />
                    Sản phẩm
                  </label>
                  <Select
                    options={todoOptions}
                    allowClear
                    showSearch
                    placeholder="Chọn sản phẩm"
                    onChange={(value) => setSelectProduct(value)}
                    filterOption={(input, option) => {
                      if (!option?.searchText) return false;
                      return option.searchText.includes(input.toLowerCase());
                    }}
                    optionFilterProp="label"
                    className="!rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* ── Data Table ────────────────────────────────────── */}
            <div className="rounded-xl border border-gray-100 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50">
              {/* Header Row */}
              <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Ngày
                </span>
                <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Loại
                </span>
                <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Số lượng
                </span>
              </div>
              {/* Data Rows */}
              <Spin spinning={isLoading}>
                {histories?.data && histories.data.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {histories.data.map((history) => (
                      <div
                        key={history.id}
                        className="grid grid-cols-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {dayjs(history.date).format('DD/MM/YYYY')}
                        </span>
                        <span>
                          <Tag color="blue" className="!text-xs">
                            {
                              productStatusOptions.find(
                                (item) => item.value === history.status
                              )?.label
                            }
                          </Tag>
                        </span>
                        <span className="font-semibold text-blue-600">
                          {history.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8">
                    <Empty description="Không có dữ liệu" />
                  </div>
                )}
              </Spin>
            </div>
          </div>
        </div>
      </ComponentCard>
    </>
  );
};
