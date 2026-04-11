import { ProductHistoryStatusType, ProductType } from '@/types/productType';
import { DeleteButton, EditButton } from '@components/common/ActionButtons';
import { deleteProductHistoryDetail } from '@services/ProductService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, message, Modal } from 'antd';
import { ReactNode, useState } from 'react';

interface EditModalProps {
  id: string;
  quantity: number;
  productId: ProductType['id'];
  status: ProductHistoryStatusType['status'];
  children?: ReactNode;
}

interface DeleteModalProps {
  id: string;
  description: ReactNode;
}

export const EditModal: React.FC<EditModalProps> = ({ id, children }) => {
  const triggerInlineEdit = () => {
    window.dispatchEvent(new CustomEvent(`trigger-inline-edit-${id}`));
  };

  return (
    <>
      {children ? (
        <div
          onClick={triggerInlineEdit}
          className="inline-block cursor-pointer"
        >
          {children}
        </div>
      ) : (
        <EditButton onClick={triggerInlineEdit} />
      )}
    </>
  );
};

export const DeleteModal: React.FC<DeleteModalProps> = ({
  id,
  description
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['deleteProductDetail'],
    mutationFn: (id: string) => {
      return deleteProductHistoryDetail(id);
    },
    onMutate: () => {
      message.loading({
        content: 'Đang xóa...',
        key: 'deleteProductDetail'
      });
    },
    onSuccess: () => {
      message.success({
        content: 'Xóa thành công',
        key: 'deleteProductDetail'
      });
      queryClient.invalidateQueries();
      handleClose();
    },
    onError: () => {
      message.error({
        content: 'Xóa thất bại',
        key: 'deleteProductDetail'
      });
    }
  });

  const handleDelete = () => {
    mutate(id);
  };

  return (
    <>
      <DeleteButton onClick={handleOpen} />
      <Modal
        title="Xóa lịch sử cập nhật"
        open={open}
        loading={isPending}
        onCancel={handleClose}
        footer={
          <Button variant="solid" color="danger" onClick={handleDelete}>
            Xóa
          </Button>
        }
      >
        {description}
      </Modal>
    </>
  );
};
