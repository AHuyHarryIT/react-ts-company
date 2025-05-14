import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, message, Modal } from 'antd';
import { ReactNode, useState } from 'react';

import { deleteWorkScheduleCategory } from '@services/WorkScheduleCategoryService';

import { BiTrash } from 'react-icons/bi';

interface DeleteModalProps {
  id: string;
  name: string;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ id, name }) => {
  const [open, setOpen] = useState(false);
  const [modalText, setModalText] = useState<ReactNode>(
    <p>
      Bạn có chắc chắn muốn xóa danh mục làm việc{' '}
      <strong>
        {name} - {id}
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
    mutationKey: ['deleteWorkScheduleCategory'],
    mutationFn: (id: string) => deleteWorkScheduleCategory(id),
    onSuccess: () => {
      message.success('Xóa danh mục lịch làm việc thành công!');
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['workScheduleCategories'] });
    },
    onError: (error) => {
      console.error(error);
      message.error(error.message || String(error));
    },
    onMutate: () => {
      setModalText(
        <p>
          Đang xóa danh mục lịch làm việc{' '}
          <strong>
            {name} - {id}
          </strong>{' '}
          ...
        </p>
      );
    }
  });

  const handleOk = () => {
    mutate(id);
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
