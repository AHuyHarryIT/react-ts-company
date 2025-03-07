import { Button, message, Modal } from 'antd';
import { ReactNode, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@stores/index';
import { fetchWorkSchedules } from '@stores/workScheduleSlice';
import { apiDeleteWorkSchedule } from '@services/workScheduleService';
import { setError } from '@stores/roleSlice';
import { BiTrash } from 'react-icons/bi';

interface DeleteModalProps {
  page: number;
  limit: number;
  id: string;
  name: string;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  page,
  limit,
  id,
  name,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleDelete = async () => {
    setLoading(true);

    setModalText(
      <p>
        Đang xóa lịch làm việc{' '}
        <strong>
          {name} - {id}
        </strong>
        ...
      </p>
    );

    try {
      await apiDeleteWorkSchedule(id);
      dispatch(fetchWorkSchedules({ params: { page, limit } }));
      message.success('Xóa lịch làm việc thành công');
    } catch (error) {
      console.error(error);
      message.error(error as string);
      dispatch(setError(error as string));
    } finally {
      setLoading(false);
    }
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
