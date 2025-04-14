import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, message, Modal } from 'antd';
import React, { useState } from 'react';

import { deleteEmployee } from '@services/EmployeeService';

import { BiTrash } from 'react-icons/bi';

interface DeleteProps {
  id: string;
  name: string;
  code: string;
}

export const DeleteModal: React.FC<DeleteProps> = ({
  id,
  name,
  code
}: DeleteProps) => {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = () => {
    mutate(id);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ['deleteEmployee'],
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      handleCancel();
      queryClient.invalidateQueries({ queryKey: ['fetchEmployees'] });
    },
    onError: (error) => {
      message.error('Xóa nhân viên thất bại');
      console.error(error);
    }
  });

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
        loading={isPending}
        okButtonProps={{ danger: true }}
        okText="Xóa"
        cancelText="Hủy"
      >
        {isPending ? (
          <p>
            Đang xóa nhân viên{' '}
            <strong>
              {name} - {code}
            </strong>{' '}
            ...
          </p>
        ) : (
          <p>
            Bạn có chắc chắn muốn xóa nhân viên{' '}
            <strong>
              {name} - {code}
            </strong>{' '}
            không?
          </p>
        )}
      </Modal>
    </>
  );
};
