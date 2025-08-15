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

import { addWorkSchedule } from '@services/workScheduleService';

import { FaPlus } from 'react-icons/fa';

type FormField = {
  title: string;
  start_date: Dayjs | null;
  fileImport: File;
};

export const AddWorkSchedule = () => {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [scheduleFile, setScheduleFile] = useState<File>();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: addWorkSchedule,
    mutationKey: ['addWorkSchedule'],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workSchedules'] });
      message.success('Thêm lịch làm việc thành công');
      handleClose();
    },
    onError: (error) => {
      message.error(error.message);
    }
  });

  const onFinish: FormProps<FormField>['onFinish'] = async (
    value: FormField
  ) => {
    const data = {
      title: value.title,
      start_date: value.start_date?.format('YYYY-MM-01') || '',
      fileImport: scheduleFile as File
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
        onClick={handleOpen}
      >
        Thêm lịch làm việc
      </Button>
      <Modal
        title="Thêm lịch làm việc"
        open={open}
        onCancel={handleClose}
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
            <Input />
          </Form.Item>
          <Form.Item<FormField>
            name="start_date"
            label="Chọn tháng"
            rules={[{ required: true, message: 'Vui lòng chọn chọn tháng' }]}
          >
            <DatePicker
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
              accept=".xls*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setScheduleFile(file);
                }
              }}
            />
          </Form.Item>
          <div className="text-end">
            <Button
              color="green"
              variant="solid"
              htmlType="submit"
              loading={isPending}
            >
              Import
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};
