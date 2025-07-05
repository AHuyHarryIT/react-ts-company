import { Button, Modal, Tooltip } from 'antd';
import { useState } from 'react';
import { ZodObject, ZodRawShape } from 'zod';
import { AxiosRequestConfig } from 'axios';

import { UpdateForm } from '@components/ui/CRUD/UpdateForm';
import { CrudServiceType } from '@utils/crudService';
import { FieldConfig } from '@/types/form';

import { FaPen } from 'react-icons/fa6';

interface UpdateFormProps<TData, TCreateDto, TUpdateDto> {
  id: string;
  service: CrudServiceType<TData, TCreateDto, TUpdateDto>;
  schema: ZodObject<ZodRawShape>;
  fields: FieldConfig[];
  config?: AxiosRequestConfig;
}

export function UpdateModal<
  TData extends object,
  TCreateDto extends object,
  TUpdateDto extends object
>({
  id,
  service,
  schema,
  fields = [],
  config = {}
}: UpdateFormProps<TData, TCreateDto, TUpdateDto>) {
  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Cập nhật">
        <Button
          color="primary"
          variant="solid"
          icon={<FaPen />}
          onClick={showModal}
        >
          Sửa
        </Button>
      </Tooltip>
      <Modal
        title="Cập nhật"
        open={open}
        onCancel={handleClose}
        destroyOnClose
        centered
        footer={null}
      >
        {open && (
          <UpdateForm
            id={id}
            schema={schema}
            service={service}
            fields={fields}
            onSuccess={handleClose}
            isGrid={false}
            config={config}
          />
        )}
      </Modal>
    </>
  );
}
