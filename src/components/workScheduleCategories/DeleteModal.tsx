import { Button, message, Modal } from 'antd';
import { ReactNode, useState } from 'react';
import { useDispatch } from 'react-redux';

import { apiDeleteWorkScheduleCategory } from '@services/WorkScheduleCategoryService';
import { AppDispatch } from '@stores/index';
import {
  fetchWorkScheduleCategories,
  setError,
} from '@stores/workScheduleCategorySlice';
import { BiTrash } from 'react-icons/bi';

interface DeleteModalProps {
  id: string;
  name: string;
  page: number;
  limit: number;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  id,
  name,
  page,
  limit,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalText, setModalText] = useState<ReactNode>(
    <p>
      Bạn có chắc chắn muốn xóa danh mục làm việc{' '}
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

  const handleOk = async () => {
    setLoading(true);

    setModalText(
      <p>
        Đang xóa danh mục làm việc{' '}
        <strong>
          {name} - {id}
        </strong>
        ...
      </p>
    );

    try {
      await apiDeleteWorkScheduleCategory(id);
      dispatch(fetchWorkScheduleCategories({ params: { page, limit } }));
    } catch (error) {
      console.error(error);
      message.error(
        (error as string) || 'Xóa danh mục lịch làm việc thất bại!'
      );
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
