import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  DatePicker,
  Form,
  FormProps,
  Input,
  message,
  Modal
} from 'antd';
import type { Dayjs } from 'dayjs';
import { useState } from 'react';

import { addSalary, AddSalaryParams } from '@services/SalaryService';

import { FaPlus } from 'react-icons/fa6';

type FormField = {
  title: string;
  start_date: Dayjs | null;
  end_date: Dayjs | null;
  importVVP: File;
  importA7A: File;
};

export const AddSalary = () => {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [vvpFile, setVvpFile] = useState<File>();
  const [a7aFile, setA7aFile] = useState<File>();

  const showModal = () => {
    setOpen(true);
  };

  const onCancel = () => {
    setOpen(false);
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ['addSalary'],
    mutationFn: (data: AddSalaryParams) => {
      return addSalary({
        title: data.title,
        start_date: data.start_date,
        end_date: data.end_date,
        importA7A: data.importA7A,
        importVVP: data.importVVP
      });
    },
    onSuccess: () => {
      message.success('Thêm bản lương thành công');

      queryClient.invalidateQueries();
    },
    onError: () => {
      message.error('Lỗi khi thêm bản lương');
      console.error('Failed to add salary');
    }
  });

  const onFinish: FormProps<FormField>['onFinish'] = async (
    value: FormField
  ) => {
    const data: AddSalaryParams = {
      title: value.title,
      start_date: value.start_date?.format('YYYY-MM-DD') || '',
      end_date: value.end_date?.format('YYYY-MM-DD') || '',
      importVVP: vvpFile as File,
      importA7A: a7aFile as File
    };

    mutate(data);
  };

  const formProps: FormProps = {
    layout: 'vertical',
    onFinish: onFinish
  };

  return (
    <>
      <Button
        color="green"
        variant="solid"
        icon={<FaPlus />}
        size="large"
        onClick={showModal}
      >
        Thêm bản lương
      </Button>

      <Modal
        title="Thêm bản lương"
        open={open}
        onCancel={onCancel}
        destroyOnHidden
        centered
        footer={null}
      >
        <Form {...formProps}>
          <Form.Item<FormField>
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item<FormField>
            name="start_date"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker
              size="large"
              style={{ width: '100%' }}
              format={'YYYY-MM-DD'}
            />
          </Form.Item>
          <Form.Item<FormField>
            name="end_date"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
          >
            <DatePicker
              size="large"
              style={{ width: '100%' }}
              format={'YYYY-MM-DD'}
            />
          </Form.Item>

          <Form.Item<FormField>
            name="importVVP"
            label="Chọn file VVP"
            rules={[{ required: true, message: 'Vui lòng chọn file VVP' }]}
          >
            <Input
              type="file"
              size="large"
              accept=".xls*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setVvpFile(file);
              }}
            />
          </Form.Item>
          <Form.Item<FormField>
            name="importA7A"
            label="Chọn file A7A"
            rules={[{ required: true, message: 'Vui lòng chọn file A7A' }]}
          >
            <Input
              type="file"
              size="large"
              accept=".xls*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setA7aFile(file);
              }}
            />
          </Form.Item>

          <div className="text-end">
            <Button
              color="green"
              variant="solid"
              htmlType="submit"
              loading={isPending}
              size="large"
            >
              Import
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};
