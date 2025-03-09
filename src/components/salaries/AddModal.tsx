import {
  Button,
  Modal,
  Form,
  Input,
  Tooltip,
  FormProps,
  message,
  DatePicker,
} from 'antd';
import { useState } from 'react';
import type { Dayjs } from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '@stores/index';
import { FaPlus } from 'react-icons/fa6';
import { fetchRoles } from '@stores/roleSlice';
import { apiAddSalary } from '@services/SalaryService';

interface AddSalaryProps {
  page: number;
  limit: number;
}

type FormField = {
  title: string;
  start_date: Dayjs | null;
  end_date: Dayjs | null;
  importVVP: File;
  importA7A: File;
};

export const AddSalary: React.FC<AddSalaryProps> = ({ page, limit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isMobile } = useSelector((state: RootState) => state.sidebar);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const onCancel = () => {
    setOpen(false);
  };

  const onFinish: FormProps<FormField>['onFinish'] = async (
    value: FormField
  ) => {
    setLoading(true);

    const data = {
      title: value.title,
      start_date: value.start_date?.format('YYYY/MM/DD') || '',
      end_date: value.end_date?.format('YYYY/MM/DD') || '',
      importVVP: value.importVVP,
      importA7A: value.importA7A,
    };

    try {
      await apiAddSalary(
        data.title,
        data.start_date,
        data.end_date,
        data.importA7A,
        data.importVVP
      );

      dispatch(fetchRoles({ params: { page, limit } }));
      message.success('Thêm bản lương thành công');
      setOpen(false);
    } catch (error) {
      message.error((error as string) || 'Lỗi khi thêm bản lương');
      console.error('Failed to add salary');
    } finally {
      setLoading(false);
    }
  };

  const formProps: FormProps = {
    layout: 'vertical',
    onFinish: onFinish,
  };

  return (
    <>
      <Tooltip title="Thêm">
        <Button
          color="green"
          variant="solid"
          icon={<FaPlus />}
          size="large"
          onClick={showModal}
        >
          {!isMobile && <>Thêm bản lương</>}
        </Button>
      </Tooltip>

      <Modal
        title="Thêm bản lương"
        open={open}
        onCancel={onCancel}
        destroyOnClose
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
              format={'YYYY/MM/DD'}
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
              format={'YYYY/MM/DD'}
            />
          </Form.Item>

          <Form.Item<FormField>
            name="importVVP"
            label="Chọn file VVP"
            rules={[{ required: true, message: 'Vui lòng chọn file VVP' }]}
          >
            <Input type="file" />
          </Form.Item>
          <Form.Item<FormField>
            name="importA7A"
            label="Chọn file A7A"
            rules={[{ required: true, message: 'Vui lòng chọn file A7A' }]}
          >
            <Input type="file" size="large" />
          </Form.Item>

          <div className="text-end">
            <Button
              color="green"
              variant="solid"
              htmlType="submit"
              loading={loading}
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
