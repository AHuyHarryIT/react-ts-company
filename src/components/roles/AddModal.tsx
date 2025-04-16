import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Tooltip,
  type FormProps,
} from 'antd';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { apiAddRole } from '@services/RoleService';
import { AppDispatch, RootState } from '@stores/index';
import { fetchRoles } from '@stores/roleSlice';

import { FaPlus } from 'react-icons/fa6';

interface AddRoleProps {
  page: number;
  limit: number;
}

type FormField = {
  role_name: string;
};

export const AddRole = ({ page, limit }: AddRoleProps) => {
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
      await apiAddRole(values.role_name);
      message.success('Thêm chức vụ thành công!');
      dispatch(fetchRoles({ params: { page, limit } }));

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
        title="Thêm chức vụ"
        open={open}
        onCancel={onCancel}
        destroyOnClose
        centered
        footer={null}
      >
        <Form layout="vertical" name="add-role" onFinish={onFinish}>
          <Form.Item<FormField>
            label="Tên chức vụ"
            name="role_name"
            rules={[{ required: true, message: 'Vui lòng nhập tên chức vụ!' }]}
          >
            <Input placeholder="Tên chức vụ" size="large" />
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
