import React, { useState, useRef, useEffect } from 'react';
import { InputNumber, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProductHistoryDetail } from '@services/ProductService';
import { ProductHistoryStatusType, ProductType } from '@/types/productType';

interface InlineEditQuantityProps {
  id: string;
  quantity: number;
  productId: ProductType['id'];
  status: ProductHistoryStatusType['status'];
}

export const InlineEditQuantity: React.FC<InlineEditQuantityProps> = ({
  id,
  quantity,
  productId,
  status
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(quantity);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputRef = useRef<any>(null);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['updateProductDetail', id],
    mutationFn: (newQuantity: number) => {
      return updateProductHistoryDetail(id, productId, status, newQuantity);
    },
    onMutate: () => {
      message.loading({ content: 'Đang lưu...', key: 'inlineUpdate' });
    },
    onSuccess: () => {
      message.success({ content: 'Cập nhật thành công', key: 'inlineUpdate' });
      queryClient.invalidateQueries();
      setIsEditing(false);
    },
    onError: () => {
      message.error({ content: 'Cập nhật thất bại', key: 'inlineUpdate' });
      setValue(quantity); // revert to original
      setIsEditing(false);
    }
  });

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isEditing]);

  // Sync state if quantity changes externally
  useEffect(() => {
    setValue(quantity);
  }, [quantity]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const submitEdit = () => {
    if (value !== quantity) {
      mutate(value);
    } else {
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    submitEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitEdit();
    } else if (e.key === 'Escape') {
      setValue(quantity);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <InputNumber
        ref={inputRef}
        min={0}
        value={value}
        onChange={(val) => setValue(val || 0)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={isPending}
        className="w-24 text-center"
        size="small"
      />
    );
  }

  return (
    <span
      onDoubleClick={handleDoubleClick}
      className={`cursor-text border-b border-dashed border-blue-400 pb-[1px] font-semibold transition-colors select-none ${
        isPending ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'
      }`}
      title="Nhấn đúp (Double-click) để sửa trực tiếp"
    >
      {(quantity || 0).toLocaleString()}
    </span>
  );
};
