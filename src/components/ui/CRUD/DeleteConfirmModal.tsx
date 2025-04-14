import { Modal } from 'antd';
import React from 'react';

import { useDynamicCrudForm } from '@/hooks/useDynamicCrudForm';
import { CrudServiceType } from '@/utils/crudService';

interface DeleteConfirmModalProps<
  TData extends object,
  TCreateDto extends object,
  TUpdateDto extends object
> {
  open: boolean;
  onClose: () => void;
  id: string | number;
  service: CrudServiceType<TData, TCreateDto, TUpdateDto>;
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
  title?: string;
  content?: React.ReactNode;
}

export function DeleteConfirmModal<
  TData extends object,
  TCreateDto extends object = TData,
  TUpdateDto extends object = TCreateDto
>({
  open,
  onClose,
  id,
  service,
  onSuccess,
  onError,
  title = 'Xác nhận xóa',
  content = 'Bạn có chắc chắn muốn xóa mục này?'
}: DeleteConfirmModalProps<TData, TCreateDto, TUpdateDto>) {
  const { deleteItem, isDeleting } = useDynamicCrudForm({
    id,
    service,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    onError
  });

  return (
    <Modal
      open={open}
      title={title}
      onOk={() => deleteItem()}
      confirmLoading={isDeleting}
      onCancel={onClose}
      okButtonProps={{ danger: true }}
      okText="Xóa"
      cancelText="Hủy"
      centered
    >
      {content}
    </Modal>
  );
}
