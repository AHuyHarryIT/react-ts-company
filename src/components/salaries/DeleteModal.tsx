import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message, Modal } from 'antd';
import { ReactNode, useState } from 'react';

import { deleteSalary } from '@services/SalaryService';

import AppButton from '@components/common/AppButton';
import { BiTrash } from 'react-icons/bi';

interface DeleteModalProps {
  id: string;
  title: string;
  onDeleted?: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  id,
  title,
  onDeleted
}) => {
  const [open, setOpen] = useState(false);
  const [modalText, setModalText] = useState<ReactNode>(
    <p>
      Bạn có chắc chắn muốn xóa bảng lương{' '}
      <strong>
        {title} - {id}
      </strong>{' '}
      không?
    </p>
  );

  const queryClient = useQueryClient();

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ['deleteSalary'],
    mutationFn: (id: string) => {
      return deleteSalary(id);
    },
    onSuccess: () => {
      setOpen(false);
      message.success('Xóa bảng lương thành công');
      onDeleted?.();
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['adminSalaryPreview'] });
    },
    onError: (error) => {
      console.error(error);
      message.error('Xóa bảng lương thất bại');
      setModalText(
        <p>
          Bạn có chắc chắn muốn xóa bảng lương{' '}
          <strong>
            {title} - {id}
          </strong>{' '}
          không?
        </p>
      );
    },
    onMutate: () => {
      setModalText(
        <p>
          Đang xóa bảng lương{' '}
          <strong>
            {title} - {id}
          </strong>
          ...
        </p>
      );
    }
  });

  const handleDelete = () => {
    mutate(id);
  };

  return (
    <>
      <AppButton tone="danger" icon={<BiTrash />} onClick={showModal}>
        Xóa
      </AppButton>
      <Modal
        title="Xóa bảng lương"
        open={open}
        onCancel={handleCancel}
        onOk={handleDelete}
        confirmLoading={isPending}
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
