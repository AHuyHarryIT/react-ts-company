import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, message, Modal } from 'antd';
import { ReactNode, useState } from 'react';

import { deleteWorkSchedule } from '@services/workScheduleService';

import { BiTrash } from 'react-icons/bi';

interface DeleteModalProps {
  id: string;
  name: string;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ id, name }) => {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [modalText, setModalText] = useState<ReactNode>(
    <p>
      Bạn có chắc chắn muốn xóa lịch làm việc{' '}
      <strong>
        {name} - {id}
      </strong>{' '}
      không?
    </p>
  );

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: deleteWorkSchedule,
    mutationKey: ['deleteWorkSchedule'],
    onSuccess: () => {
      message.success('Xóa lịch làm việc thành công');
      handleCancel();
      queryClient.invalidateQueries({ queryKey: ['workSchedules'] });
    },
    onError: (error) => {
      message.error(error.message);
    },
    onMutate: () => {
      setModalText(
        <p>
          Đang xóa lịch làm việc{' '}
          <strong>
            {name} - {id}
          </strong>
          ...
        </p>
      );
    }
  });

  const handleDelete = async () => {
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
        title="Xóa lịch làm việc"
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
