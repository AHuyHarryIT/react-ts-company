import { CrudServiceType } from '@utils/crudService';
import { Button, Modal } from 'antd';

import { useDynamicCrudForm } from '@/hooks/useDynamicCrudForm';
import { BiTrash } from 'react-icons/bi';
import { LuUndoDot } from 'react-icons/lu';
import { useState } from 'react';

interface DeleteProps<TData, TCreateDto, TUpdateDto> {
  id: string;
  service: CrudServiceType<TData, TCreateDto, TUpdateDto>;
  content?: React.ReactNode;
  isRestore?: boolean;
}

export function DeleteButton<
  TData extends object,
  TCreateDto extends object,
  TUpdateDto extends object
>({
  id,
  service,
  content,
  isRestore
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
        size="large"
        variant="solid"
        color={isRestore ? 'gold' : 'danger'}
        icon={isRestore ? <LuUndoDot /> : <BiTrash />}
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
          size: 'large',
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
          size: 'large'
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
