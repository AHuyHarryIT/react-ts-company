import { Button, message, Modal } from 'antd';
import React, { ReactNode, useState } from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '@stores/index';
import { fetchRoles, setError } from '@stores/roleSlice';

import { apiDeleteRole } from '@services/RoleService';
import { BiTrash } from 'react-icons/bi';

interface DeleteProps {
  id: string;
  name: string;
  page: number;
  limit: number;
}

export const DeleteModal: React.FC<DeleteProps> = ({
  id,
  name,
  page,
  limit,
}: DeleteProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalText, setModalText] = useState<ReactNode>(
    <p>
      Bạn có chắc chắn muốn xóa chức vụ{' '}
      <strong>
        {name} - {id}
      </strong>{' '}
      không?
    </p>
  );

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = async () => {
    setLoading(true);

    setModalText(
      <p>
        Đang xóa chức vụ{' '}
        <strong>
          {name} - {id}
        </strong>
        ...
      </p>
    );

    try {
      await apiDeleteRole(id);
      dispatch(fetchRoles({ params: { page, limit } }));

      message.success('Xóa chức vụ thành công!');
    } catch (error) {
      console.error(error);
      message.error(error as string);
      dispatch(setError(error as string));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        color="danger"
        variant="solid"
        icon={<BiTrash />}
        onClick={showModal}
      >
        Xóa
      </Button>
      <Modal
        title="Xác nhận xóa"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        okButtonProps={{ danger: true }}
        okText="Xóa"
        cancelText="Hủy"
        centered
      >
        {modalText}
      </Modal>
    </>
  );
};
