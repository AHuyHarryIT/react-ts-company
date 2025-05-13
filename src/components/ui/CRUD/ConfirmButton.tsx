import { Button, Modal } from 'antd';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { useState } from 'react';

import { useDynamicCrudForm } from '@hooks/useDynamicCrudForm';
import { CrudServiceType } from '@utils/crudService';

import { IconDelete, IconRestore } from '@components/icons';

interface DeleteProps<TData, TCreateDto, TUpdateDto> {
  id: string;
  service: CrudServiceType<TData, TCreateDto, TUpdateDto>;
  content?: React.ReactNode;
  isRestore?: boolean;
  size?: SizeType;
}

export function ConfirmButton<
  TData extends object,
  TCreateDto extends object,
  TUpdateDto extends object
>({
  id,
  service,
  content,
  isRestore,
  size = 'middle'
}: DeleteProps<TData, TCreateDto, TUpdateDto>) {
  const [open, setOpen] = useState(false);
  const { deleteItem, isDeleting, restoreItem, isRestoring } =
    useDynamicCrudForm({
      id,
      service
    });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        size={size}
        variant="solid"
        color={isRestore ? 'gold' : 'red'}
        icon={isRestore ? <IconRestore /> : <IconDelete />}
        onClick={handleOpen}
        loading={isDeleting}
      >
        {isRestore ? 'Khôi phục' : 'Xóa'}
      </Button>

      <Modal
        title={
          <>
            <span className="text-xl font-semibold text-gray-800">
              {isRestore ? 'Xác nhận khôi phục' : 'Xác nhận xóa'}
            </span>
          </>
        }
        loading={isDeleting || isRestoring}
        open={open}
        centered
        okButtonProps={{
          loading: isDeleting || isRestoring,
          danger: !isRestore,
          size,
          variant: 'solid',
          color: isRestore ? 'gold' : 'danger'
        }}
        okText={isRestore ? 'Khôi phục' : 'Xóa'}
        onOk={() => {
          if (isRestore) {
            restoreItem();
          } else {
            deleteItem();
          }
        }}
        cancelButtonProps={{
          size
        }}
        onCancel={handleClose}
        cancelText="Hủy"
      >
        {content ||
          (isRestore
            ? 'Bạn có chắc chắn muốn khôi phục?'
            : 'Bạn có chắc chắn muốn xóa?')}
      </Modal>
    </>
  );
}
