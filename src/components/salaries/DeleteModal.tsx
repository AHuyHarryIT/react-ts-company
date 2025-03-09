import { Button, message, Modal } from 'antd';
import { ReactNode, useState } from 'react';
import { useDispatch } from 'react-redux';

import { apiDeleteSalary } from '@services/SalaryService';
import { AppDispatch } from '@stores/index';
import { setError } from '@stores/roleSlice';
import { fetchSalaries } from '@stores/salarySlice';

import { BiTrash } from 'react-icons/bi';

interface DeleteModalProps {
  id: string;
  title: string;
  page: number;
  limit: number;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  id,
  title,
  page,
  limit,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalText, setModalText] = useState<ReactNode>(
    <p>
      Bạn có chắc chắn muốn xóa bảng lương{' '}
      <strong>
        {title} - {id}
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
        Đang xóa bảng lương{' '}
        <strong>
          {title} - {id}
        </strong>
        ...
      </p>
    );

    try {
      await apiDeleteSalary(id);
      dispatch(fetchSalaries({ params: { page, limit } }));
      message.success('Xóa thành công');
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
        title="Xóa bảng lương"
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
