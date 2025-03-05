import { Button, Form, FormProps, Input, Modal, Tooltip, message } from 'antd';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { apiAddWorkScheduleCategory } from '@services/WorkScheduleCategoryService';
import { AppDispatch, RootState } from '@stores/index';
import { fetchWorkScheduleCategories } from '@stores/workScheduleCategorySlice';

import { FaPlus } from 'react-icons/fa';

interface AddWorkScheduleCategoryProps {
  page: number;
  limit: number;
}

type FormField = {
  name: string;
};

export const AddModal: React.FC<AddWorkScheduleCategoryProps> = ({
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
    values: FormField
  ) => {
    setLoading(true);

    try {
      await apiAddWorkScheduleCategory(values.name);
      message.success('Thêm thành công!');
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
      <Tooltip title="Thêm">
        <Button
          color="green"
          variant="solid"
          icon={<FaPlus />}
          size="large"
          onClick={showModal}
        >
          {!isMobile && <>Thêm</>}
        </Button>
      </Tooltip>
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
                message: 'Vui lòng nhập tên danh mục lịch làm việc!',
              },
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
              loading={loading}
            >
              Thêm
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};
