import { rejectStamp } from '@services/StampService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, message, Modal } from 'antd';
import React, { useState } from 'react';
import { FaBan } from 'react-icons/fa';

interface RejectModalProps {
  stampId: string;
}

export const RejectModal: React.FC<RejectModalProps> = ({ stampId }) => {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['rejectStamp'],
    mutationFn: async (id: string) => {
      await rejectStamp(id);
    },
    onSuccess: () => {
      setOpen(false);
      message.success('Tem đã được từ chối thành công');
      queryClient.invalidateQueries();
    },
    onError: () => {
      message.error('Lỗi khi từ chối tem');
      console.error('Failed to reject stamp');
    }
  });
  return (
    <>
      <Button
        variant="solid"
        color="red"
        icon={<FaBan />}
        children="Từ chối"
        onClick={() => setOpen(true)}
      />
      <Modal
        title="Xác nhận từ chối"
        confirmLoading={isPending}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => {
          mutate(stampId);
        }}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn từ chối in tem này không?</p>
      </Modal>
    </>
  );
};
