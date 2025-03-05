import { apiUpdateWorkScheduleCategory } from '@services/WorkScheduleCategoryService';
import { AppDispatch } from '@stores/index';
import { fetchWorkScheduleCategories } from '@stores/workScheduleCategorySlice';
import { Button, Form, FormProps, Input, message, Modal, Tooltip } from 'antd';
import { useState } from 'react';
import { FaPen } from 'react-icons/fa6';
import { useDispatch } from 'react-redux';

interface UpdateWorkScheduleCategoryProps {
  categoryId: string;
  categoryName: string;
  page: number;
  limit: number;
}

type FormField = {
  name: string;
};

export const UpdateWorkScheduleCategory: React.FC<
  UpdateWorkScheduleCategoryProps
> = ({ categoryId, categoryName, page, limit }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const onCancel = () => {
    setOpen(false);
  };

  const onFinish: FormProps<FormField>['onFinish'] = async (
    values: FormField
  ) => {
    setLoading(true);

    try {
      await apiUpdateWorkScheduleCategory(categoryId, values.name);
      message.success('Cập nhật chức vụ thành công!');
      dispatch(fetchWorkScheduleCategories({ params: { page, limit } }));

      setOpen(false);
    } catch (error) {
      console.error(error);
      message.error(error as string);
    } finally {
      setLoading(false);
    }
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
                message: 'Vui lòng nhập tên danh mục lịch làm việc!',
              },
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
              loading={loading}
            >
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};
