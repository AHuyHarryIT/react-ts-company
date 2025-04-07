import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, FormProps, Input, message, Modal, Tooltip } from 'antd';
import { useState } from 'react';

import { updateWorkScheduleCategory } from '@services/WorkScheduleCategoryService';

import { FaPen } from 'react-icons/fa6';

interface UpdateWorkScheduleCategoryProps {
  categoryId: string;
  categoryName: string;
}

type FormField = {
  name: string;
};

export const UpdateWorkScheduleCategory: React.FC<
  UpdateWorkScheduleCategoryProps
> = ({ categoryId, categoryName }) => {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const showModal = () => {
    setOpen(true);
  };

  const onCancel = () => {
    setOpen(false);
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ['updateWorkScheduleCategory'],
    mutationFn: (values: FormField) =>
      updateWorkScheduleCategory(categoryId, values.name),
    onSuccess: () => {
      message.success({
        content: 'Cập nhật thành công!',
        key: 'update-work-schedule-category'
      });
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: ['workScheduleCategories']
      });
    },
    onError: (error) => {
      console.error(error);
      message.error({
        content: error.message || String(error),
        key: 'update-work-schedule-category'
      });
    },
    onMutate: () => {
      message.loading({
        content: 'Đang cập nhật danh mục lịch làm việc...',
        key: 'update-work-schedule-category'
      });
    }
  });

  const onFinish: FormProps<FormField>['onFinish'] = (values: FormField) => {
    mutate(values);
  };

  return (
    <>
      <Tooltip title="Cập nhật">
        <Button
          color="primary"
          variant="solid"
          icon={<FaPen />}
          onClick={showModal}
        >
          Sửa
        </Button>
      </Tooltip>
      <Modal
        title="Cập nhật mục lịch làm việc"
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
          initialValues={{ name: categoryName }}
        >
          <Form.Item<FormField>
            label="Tên danh mục lịch làm việc"
            name="name"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập tên danh mục lịch làm việc!'
              }
            ]}
          >
            <Input placeholder="Tên danh mục lịch làm việc" size="large" />
          </Form.Item>
          <div className="text-right">
            <Button
              color="primary"
              variant="solid"
              htmlType="submit"
              size="large"
              loading={isPending}
            >
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};
