import { Button, Modal, Tooltip } from 'antd';
import { AxiosRequestConfig } from 'axios';
import { useState } from 'react';
import { ZodObject, ZodRawShape } from 'zod';

import { FieldConfig } from '@/types/form';
import { CrudServiceType } from '@utils/crudService';
import { CreateForm } from './CreateForm';

import { FaPlus } from 'react-icons/fa6';

interface CreateRoleProps<
  TData extends object,
  TCreateDto extends object,
  TUpdateDto extends object
> {
  title?: string;
  service: CrudServiceType<TData, TCreateDto, TUpdateDto>;
  schema: ZodObject<ZodRawShape>;
  fields: FieldConfig[];
  config?: AxiosRequestConfig;
}

export function CreateModal<
  TData extends object,
  TCreateDto extends object,
  TUpdateDto extends object
>({
  title = 'Thêm mới',
  service,
  schema,
  fields = [],
  config = {}
}: CreateRoleProps<TData, TCreateDto, TUpdateDto>) {
  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip title={title}>
        <Button
          color="green"
          variant="solid"
          icon={<FaPlus />}
          size="large"
          onClick={showModal}
        >
          {title}
        </Button>
      </Tooltip>
      <Modal
        title={title}
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
          config={config}
          onSuccess={handleClose}
        />
      </Modal>
    </>
  );
}
