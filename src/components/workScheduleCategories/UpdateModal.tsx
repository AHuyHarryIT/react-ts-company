import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, FormProps, Input, message, Modal } from 'antd';
import { useState } from 'react';

import { updateWorkScheduleCategory } from '@services/WorkScheduleCategoryService';

import AppButton from '@components/common/AppButton';
import { FaPen } from 'react-icons/fa6';

import { SizeType } from 'antd/es/config-provider/SizeContext';

interface UpdateWorkScheduleCategoryProps {
  categoryId: string;
  categoryName: string;
  size?: SizeType;
}

type FormField = {
  name: string;
};

export const UpdateWorkScheduleCategory: React.FC<
  UpdateWorkScheduleCategoryProps
> = ({ categoryId, categoryName, size = 'middle' }) => {
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
      <AppButton
        tone="primary"
        size={size}
        icon={<FaPen />}
        onClick={showModal}
      >
        Sửa
      </AppButton>
      <Modal
        title="Cập nhật mục lịch làm việc"
        open={open}
        onCancel={onCancel}
        destroyOnHidden
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
            <Input placeholder="Tên danh mục lịch làm việc" />
          </Form.Item>
          <div className="text-right">
            <AppButton tone="primary" htmlType="submit" loading={isPending}>
              Cập nhật
            </AppButton>
          </div>
        </Form>
      </Modal>
    </>
  );
};
