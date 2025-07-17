import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, FormProps, Input, Modal, message } from 'antd';
import { useState } from 'react';

import { addWorkScheduleCategory } from '@services/WorkScheduleCategoryService';

import { FaPlus } from 'react-icons/fa';

type FormField = {
  name: string;
};

export const AddModal = () => {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const onCancel = () => {
    setOpen(false);
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ['addWorkScheduleCategory'],
    mutationFn: (values: FormField) => addWorkScheduleCategory(values.name),
    onSuccess: () => {
      message.success('Thêm thành công!');
      queryClient.invalidateQueries({ queryKey: ['workScheduleCategories'] });
      setOpen(false);
    },
    onError: (error) => {
      console.error(error);
      message.error(error.message || String(error));
    }
  });

  const onFinish: FormProps<FormField>['onFinish'] = (values: FormField) => {
    mutate(values);
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
        Thêm
      </Button>
      <Modal
        title="Thêm danh mục lịch làm việc"
        open={open}
        onCancel={onCancel}
        destroyOnClose
        centered
        footer={null}
      >
        <Form
          layout="vertical"
          name="add-work-schedule-calendar"
          onFinish={onFinish}
        >
          <Form.Item<FormField>
            label="Tên danh mục lịch làm việc"
            name="name"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập tên danh mục lịch làm việc!'
              },
              {
                max: 255,
                message: 'Tên danh mục lịch làm việc không được quá 255 ký tự!'
              }
            ]}
          >
            <Input placeholder="Tên danh mục lịch làm việc" size="large" />
          </Form.Item>
          <div className="text-right">
            <Button
              color="green"
              variant="solid"
              htmlType="submit"
              size="large"
              loading={isPending}
            >
              Thêm
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};
