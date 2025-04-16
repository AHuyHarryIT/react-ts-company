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
import { useDispatch } from 'react-redux';

import { apiUpdateRole } from '@services/RoleService';
import { AppDispatch } from '@stores/index';
import { fetchRoles } from '@stores/roleSlice';

import { FaPen } from 'react-icons/fa6';

interface UpdateRoleProps {
  page: number;
  limit: number;
  roleId: string;
  roleName: string;
}

type FormField = {
  role_name: string;
};

export const UpdateRole = ({
  page,
  limit,
  roleId,
  roleName,
}: UpdateRoleProps) => {
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
      await apiUpdateRole(roleId, values.role_name);
      message.success('Cập nhật chức vụ thành công!');
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
        title="Cập nhật chức vụ"
        open={open}
        onCancel={onCancel}
        destroyOnClose
        centered
        footer={null}
      >
        <Form
          layout="vertical"
          name="update-role"
          onFinish={onFinish}
          initialValues={{ role_name: roleName }}
        >
          <Form.Item<FormField>
            label="Tên chức vụ"
            name="role_name"
            rules={[{ required: true, message: 'Vui lòng nhập tên chức vụ!' }]}
          >
            <Input placeholder="Tên chức vụ" size="large" />
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
