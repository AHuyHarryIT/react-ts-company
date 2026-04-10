import { ProductHistoryStatusType, ProductType } from '@/types/productType';
import { EditButton, DeleteButton } from '@components/common/ActionButtons';
import {
  deleteProductHistoryDetail,
  updateProductHistoryDetail
} from '@services/ProductService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, InputNumber, message, Modal } from 'antd';
import { ReactNode, useState } from 'react';

interface EditModalProps {
  id: string;
  quantity: number;
  productId: ProductType['id'];
  status: ProductHistoryStatusType['status'];
  children?: ReactNode;
}

interface FormFields {
  quantity: number;
}

interface DeleteModalProps {
  id: string;
  description: ReactNode;
}

export const EditModal: React.FC<EditModalProps> = ({
  id,
  quantity,
  productId,
  status,
  children
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
    mutationKey: ['updateProductDetail'],
    mutationFn: (data: FormFields) => {
      return updateProductHistoryDetail(id, productId, status, data.quantity);
    },
    onMutate: () => {
      message.loading({
        content: 'Đang cập nhật...',
        key: 'updateProductDetail'
      });
    },
    onSuccess: () => {
      message.success({
        content: 'Cập nhật thành công',
        key: 'updateProductDetail'
      });
      queryClient.invalidateQueries();
      handleClose();
    },
    onError: () => {
      message.error({
        content: 'Cập nhật thất bại',
        key: 'updateProductDetail'
      });
    }
  });

  const handleFinish = (values: FormFields) => {
    mutate(values);
  };

  return (
    <>
      {children ? (
        <div onClick={handleOpen} className="inline-block cursor-pointer">
          {children}
        </div>
      ) : (
        <EditButton onClick={handleOpen} />
      )}
      <Modal
        title="Chỉnh sửa sản phẩm"
        open={open}
        destroyOnHidden
        onCancel={handleClose}
        loading={isPending}
        footer={null}
      >
        <Form<FormFields>
          layout="vertical"
          initialValues={{ quantity: quantity }}
          onFinish={handleFinish}
        >
          <Form.Item<FormFields>
            name="quantity"
            label="Số lượng"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>
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
