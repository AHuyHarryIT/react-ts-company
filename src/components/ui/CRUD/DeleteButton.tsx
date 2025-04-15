import { CrudServiceType } from '@utils/crudService';
import { Button } from 'antd';
import { useState } from 'react';

import { DeleteConfirmModal } from './DeleteConfirmModal';

import { BiTrash } from 'react-icons/bi';

interface DeleteProps<TData, TCreateDto, TUpdateDto> {
  id: string;
  service: CrudServiceType<TData, TCreateDto, TUpdateDto>;
  content?: React.ReactNode;
}

export function DeleteButton<
  TData extends object,
  TCreateDto extends object,
  TUpdateDto extends object
>({ id, service, content }: DeleteProps<TData, TCreateDto, TUpdateDto>) {
  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
      {open && (
        <DeleteConfirmModal
          open={open}
          id={id}
          onClose={handleClose}
          service={service}
          content={content}
        />
      )}
    </>
  );
}
