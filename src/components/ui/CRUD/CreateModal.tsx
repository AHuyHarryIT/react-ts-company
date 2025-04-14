import { useStore } from '@tanstack/react-store';
import { Button, Modal, Tooltip } from 'antd';
import { useState } from 'react';
import { ZodObject, ZodRawShape } from 'zod';

import { FieldConfig } from '@/types/form';
import { uiStore } from '@stores/uiStore';
import { CrudServiceType } from '@utils/crudService';
import { CreateForm } from './CreateForm';

import { FaPlus } from 'react-icons/fa6';

interface CreateRoleProps<
  TData extends object,
  TCreateDto extends object,
  TUpdateDto extends object
> {
  service: CrudServiceType<TData, TCreateDto, TUpdateDto>;
  schema: ZodObject<ZodRawShape>;
  fields: FieldConfig[];
}

export function CreateModal<
  TData extends object,
  TCreateDto extends object,
  TUpdateDto extends object
>({
  service,
  schema,
  fields = []
}: CreateRoleProps<TData, TCreateDto, TUpdateDto>) {
  const { isMobile } = useStore(uiStore);

  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Thêm">
        <Button
          color="green"
          variant="solid"
          icon={<FaPlus />}
          size="large"
          onClick={showModal}
        >
          {!isMobile && <>Thêm</>}
        </Button>
      </Tooltip>
      <Modal
        title="Thêm mới"
        open={open}
        onCancel={handleClose}
        destroyOnClose
        centered
        footer={null}
      >
        <CreateForm
          schema={schema}
          service={service}
          fields={fields}
          isGrid={false}
        />
      </Modal>
    </>
  );
}
