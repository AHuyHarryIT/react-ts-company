import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Table,
  TableColumnsType,
  Tag,
  Checkbox,
  message,
  Empty,
  Spin
} from 'antd';
import { useState } from 'react';
import { FaCalculator, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import dayjs from 'dayjs';

import ComponentCard from '@components/common/ComponentCard';
import RefreshButton from '@components/common/RefreshButton';
import { ActionGroup, ViewButton } from '@components/common/ActionButtons';

import {
  fetchSalaryWebList,
  createSalaryWeb
} from '@services/SalaryWebService';
import type { SalaryManager, CreateSalaryPayload } from '@/types/salaryWebType';

const { RangePicker } = DatePicker;

export default function SalaryWebList() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['salaryWebList'],
    queryFn: fetchSalaryWebList
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateSalaryPayload) => createSalaryWeb(payload),
    onSuccess: (res) => {
      message.success(res.message || 'Tạo bảng lương thành công!');
      queryClient.invalidateQueries({ queryKey: ['salaryWebList'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: () => {
      message.error('Có lỗi khi tạo bảng lương. Vui lòng thử lại.');
    }
  });

  const salaryManagers = data || [];

  const handleCreate = () => {
    form.validateFields().then((values) => {
      const [start, end] = values.dateRange;
      const payload: CreateSalaryPayload = {
        title: values.title,
        start_date: start.format('YYYY-MM-DD'),
        end_date: end.format('YYYY-MM-DD'),
        companies: values.companies
      };
      createMutation.mutate(payload);
    });
  };

  const columns: TableColumnsType<SalaryManager> = [
    {
      title: 'STT',
      width: 65,
      align: 'center',
      render: (_v, _r, i) => (
        <span className="font-mono text-xs text-gray-500">{i + 1}</span>
      )
    },
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      align: 'center',
      render: (v) => (
        <Tag className="!m-0 font-mono !text-xs" color="default">
          #{v}
        </Tag>
      )
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      render: (value) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {value || <span className="text-gray-400 italic">Chưa có</span>}
        </span>
      )
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'start_date',
      align: 'center',
      width: 140,
      render: (v) => (
        <Tag color="blue" className="!m-0 !text-xs">
          <FaCalendarAlt className="mr-1 inline-block" />
          {dayjs(v).format('DD/MM/YYYY')}
        </Tag>
      )
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'end_date',
      align: 'center',
      width: 140,
      render: (v) => (
        <Tag color="purple" className="!m-0 !text-xs">
          <FaCalendarAlt className="mr-1 inline-block" />
          {dayjs(v).format('DD/MM/YYYY')}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      align: 'center',
      width: 120,
      render: (_v, record) => (
        <ActionGroup>
          <Link to="/admin/salary-web/$id" params={{ id: String(record.id) }}>
            <ViewButton />
          </Link>
        </ActionGroup>
      )
    }
  ];

  return (
    <ComponentCard
      title={
        <span className="flex items-center gap-2">
          <FaCalculator className="text-indigo-500" />
          Tính Lương Trên Web
        </span>
      }
      desc="Quản lý bảng lương — Tạo mới, nhập dữ liệu và tính lương trực tiếp trên web"
    >
      <div className="space-y-5">
        {/* ── Action Bar ──────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-indigo-50/50 to-white p-4 dark:border-gray-700 dark:from-indigo-900/10 dark:to-gray-900/50">
          <RefreshButton refresh={refetch} isLoading={isFetching} />
          <Button
            type="primary"
            icon={<FaPlus />}
            onClick={() => setIsModalOpen(true)}
            className="!flex !items-center !gap-1.5 !rounded-lg !bg-gradient-to-r !from-indigo-500 !to-purple-600 !font-medium !shadow-sm hover:!from-indigo-600 hover:!to-purple-700"
          >
            Tạo bảng lương mới
          </Button>
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 dark:border-gray-600 dark:bg-gray-800">
            <HiOutlineSparkles className="text-sm text-indigo-500" />
            <span className="text-xs text-gray-500">
              Tổng:{' '}
              <strong className="text-indigo-600">
                {salaryManagers.length}
              </strong>{' '}
              bảng lương
            </span>
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : salaryManagers.length === 0 ? (
          <Empty
            description={
              <span className="text-gray-400">
                Chưa có bảng lương nào. Nhấn "Tạo bảng lương mới" để bắt đầu.
              </span>
            }
            className="py-16"
          />
        ) : (
          <Table<SalaryManager>
            rowKey="id"
            columns={columns}
            dataSource={salaryManagers}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Tổng ${total} bảng lương`,
              showSizeChanger: true
            }}
            size="middle"
            bordered={false}
            className="[&_.ant-table]:!rounded-xl [&_.ant-table]:!border-gray-100 dark:[&_.ant-table]:!border-gray-700"
          />
        )}
      </div>

      {/* ── Create Modal ──────────────────────────────────────── */}
      <Modal
        title={
          <span className="flex items-center gap-2 text-lg font-semibold">
            <FaPlus className="text-indigo-500" />
            Tạo bảng lương mới
          </span>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreate}
        okText="Tạo bảng lương"
        cancelText="Hủy"
        confirmLoading={createMutation.isPending}
        okButtonProps={{
          className:
            '!bg-gradient-to-r !from-indigo-500 !to-purple-600 !border-0 !font-medium'
        }}
        width={520}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="title"
            label={
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Tiêu đề
              </span>
            }
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input
              placeholder="VD: Bảng lương Tháng 04/2026"
              className="!rounded-lg"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label={
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Kỳ lương (Ngày bắt đầu → Kết thúc)
              </span>
            }
            rules={[{ required: true, message: 'Vui lòng chọn kỳ lương' }]}
          >
            <RangePicker
              className="!w-full !rounded-lg"
              size="large"
              format="DD/MM/YYYY"
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
            />
          </Form.Item>

          <Form.Item
            name="companies"
            label={
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Công ty
              </span>
            }
            rules={[
              { required: true, message: 'Vui lòng chọn ít nhất 1 công ty' }
            ]}
            initialValue={['a7a', 'vvp']}
          >
            <Checkbox.Group className="!flex !gap-6">
              <Checkbox value="a7a">
                <span className="text-sm font-medium">A7A</span>
              </Checkbox>
              <Checkbox value="vvp">
                <span className="text-sm font-medium">VVP</span>
              </Checkbox>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </ComponentCard>
  );
}
