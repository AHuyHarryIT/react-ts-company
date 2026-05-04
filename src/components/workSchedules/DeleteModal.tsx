import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, message, Modal } from 'antd';
import { ReactNode, useState } from 'react';

import { deleteWorkSchedule } from '@services/workScheduleService';

import { BiTrash } from 'react-icons/bi';

interface DeleteModalProps {
  id: string;
  name: string;
  isIconOnly?: boolean;
  transparent?: boolean;
  onDeleted?: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  id,
  name,
  isIconOnly,
  transparent,
  onDeleted
}) => {
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

  const showModal = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpen(true);
  };

  const handleCancel = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpen(false);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: deleteWorkSchedule,
    mutationKey: ['deleteWorkSchedule'],
    onSuccess: () => {
      message.success('Xóa lịch làm việc thành công');
      handleCancel();
      onDeleted?.();
      queryClient.invalidateQueries({ queryKey: ['workSchedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['scheduleDetails'] });
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

  const handleDelete = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    mutate(id);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Button
        danger={!transparent}
        type={transparent ? 'default' : 'primary'}
        color={transparent ? undefined : 'danger'}
        variant={transparent ? 'outlined' : 'solid'}
        className={
          transparent
            ? '!border-gray-800 !text-gray-800 hover:!border-red-500 hover:!text-red-500 dark:!border-gray-400 dark:!text-gray-400'
            : ''
        }
        icon={<BiTrash />}
        onClick={showModal}
      >
        {!isIconOnly && 'Xóa'}
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
    </div>
  );
};
