import {
  Button,
  DatePicker,
  Form,
  FormProps,
  Input,
  Modal,
  Tooltip,
  message,
} from 'antd';
import type { Dayjs } from 'dayjs';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '@stores/index';
import { fetchWorkSchedules } from '@stores/workScheduleSlice';

import { apiAddWorkSchedule } from '@services/workScheduleService';
import { FaPlus } from 'react-icons/fa';

interface AddWorkScheduleProps {
  page: number;
  limit: number;
}

type FormField = {
  title: string;
  start_date: Dayjs | null;
  fileImport: File;
};

export const AddWorkSchedule: React.FC<AddWorkScheduleProps> = ({
  page,
  limit,
}) => {
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
      start_date: value.start_date?.format('YYYY/MM/01') || '',
      fileImport: value.fileImport,
    };

    try {
      await apiAddWorkSchedule(data.title, data.start_date, data.fileImport);
      fetchWorkSchedules({ params: { page, limit } });
      dispatch(fetchWorkSchedules({ params: { page, limit } }));
      message.success('Thêm lịch làm việc thành công');
      setOpen(false);
    } catch (error) {
      console.error(error);
      message.error(error as string);
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
          {!isMobile && <>Thêm lịch làm việc</>}
        </Button>
      </Tooltip>
      <Modal
        title="Thêm lịch làm việc"
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
            label="Chọn tháng"
            rules={[{ required: true, message: 'Vui lòng chọn chọn tháng' }]}
          >
            <DatePicker
              size="large"
              style={{ width: '100%' }}
              format={'MM/YYYY'}
              picker="month"
            />
          </Form.Item>

          <Form.Item<FormField>
            name="fileImport"
            label="Chọn file"
            rules={[{ required: true, message: 'Vui lòng chọn file' }]}
          >
            <Input
              type="file"
              size="large"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            />
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
