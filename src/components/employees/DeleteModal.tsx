import { Button, Modal } from 'antd';
import React, { ReactNode, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '@stores/index';
import { deleteEmployee } from '@stores/employeeSlice';

import { BiTrash } from 'react-icons/bi';

interface DeleteProps {
  id: string;
  name: string;
  code: string;
  page: number;
  limit: number;
}

export const DeleteModal: React.FC<DeleteProps> = ({
  id,
  name,
  code,
  page,
  limit,
}: DeleteProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { deletingId } = useSelector((state: RootState) => state.employees);

  const [open, setOpen] = useState(false);
  const [modalText, setModalText] = useState<ReactNode>(
    <p>
      Bạn có chắc chắn muốn xóa nhân viên{' '}
      <strong>
        {name} - {code}
      </strong>
      {''}
      không?
    </p>
  );

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = () => {
    setModalText(
      <p>
        Đang xóa nhân viên{' '}
        <strong>
          {name} - {code}
        </strong>
        ...
      </p>
    );
    dispatch(deleteEmployee({ id, page, limit }));
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
        confirmLoading={deletingId === id}
        okButtonProps={{ danger: true }}
        okText="Xóa"
        cancelText="Hủy"
      >
        {modalText}
      </Modal>
    </>
  );
};
