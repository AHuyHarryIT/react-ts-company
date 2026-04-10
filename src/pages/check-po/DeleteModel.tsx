import { DeleteButton } from '@components/common/ActionButtons';
import { deletePurchaseOrder } from '@services/PurchaseOrdersService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message, Modal } from 'antd';
import React, { useState } from 'react';

interface DeleteModelProps {
  id: string;
  name: string;
}

export const DeleteModel: React.FC<DeleteModelProps> = ({ id, name }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationKey: ['deletePurchaseOrder', id],
    mutationFn: () => deletePurchaseOrder(id),
    onMutate: () => {
      message.loading({ content: 'Đang xóa...', key: 'delete' });
    },
    onSuccess: () => {
      message.success({ content: 'Xóa thành công!', key: 'delete' });
      setOpen(false);
      queryClient.invalidateQueries();
    },
    onError: () => {
      message.error({ content: 'Xóa thất bại!', key: 'delete' });
    }
  });

  const handleDelete = () => {
    mutate();
  };

  return (
    <>
      <DeleteButton onClick={handleOpen} />

      <Modal
        title="Xác nhận xóa"
        open={open}
        onOk={handleDelete}
        okType="danger"
        okText="Xóa"
        cancelText="Hủy"
        onCancel={handleClose}
      >
        <p>
          Bạn có chắc chắn muốn xóa sản phẩm <strong>{name}</strong> không?
        </p>
      </Modal>
    </>
  );
};
