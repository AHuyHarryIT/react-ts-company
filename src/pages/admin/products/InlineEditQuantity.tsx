import React, { useState, useRef, useEffect } from 'react';
import { InputNumber, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProductHistoryDetail } from '@services/ProductService';
import { ProductHistoryStatusType, ProductType } from '@/types/productType';
import { FaLightbulb } from 'react-icons/fa';
import { motion } from 'framer-motion';

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
  const [localQuantity, setLocalQuantity] = useState<number | null>(null);
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
    },
    onError: () => {
      message.error({ content: 'Cập nhật thất bại', key: 'inlineUpdate' });
      setValue(quantity); // revert to original
      setLocalQuantity(null);
    }
  });

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isEditing]);

  // Listen to external "Cập nhật" button clicks to focus this element
  useEffect(() => {
    const handleTrigger = () => setIsEditing(true);
    const eventName = `trigger-inline-edit-${id}`;
    window.addEventListener(eventName, handleTrigger);
    return () => window.removeEventListener(eventName, handleTrigger);
  }, [id]);

  // Sync state if quantity changes externally from refetch
  useEffect(() => {
    setValue(quantity);
    setLocalQuantity(null);
  }, [quantity]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const submitEdit = () => {
    if (value !== quantity) {
      setLocalQuantity(value); // Optimistically assume success
      setIsEditing(false); // Close input instantly for snap UI
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
      <div className="inline-flex w-28 flex-col items-center justify-center rounded-xl p-1.5">
        <div className="flex h-8 w-full items-center justify-center">
          <InputNumber
            ref={inputRef}
            min={0}
            value={value}
            onChange={(val) => setValue(val || 0)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={isPending}
            controls={false}
            className="w-full font-bold text-blue-600 shadow-sm [&_input]:!text-center"
            size="small"
          />
        </div>
        {/* Invisible placeholder to maintain identical layout dimensions */}
        <span className="pointer-events-none mt-1 flex items-center justify-center gap-1 text-[9.5px] font-medium whitespace-nowrap opacity-0 select-none">
          <FaLightbulb className="text-[10px]" /> (Nhấn để sửa)
        </span>
      </div>
    );
  }

  return (
    <motion.div
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      className={`group inline-flex w-28 cursor-pointer flex-col items-center justify-center rounded-xl p-1.5 transition-all select-none ${
        isPending
          ? 'cursor-not-allowed text-gray-400'
          : 'text-blue-600 active:bg-blue-50 md:hover:bg-blue-50 md:hover:text-blue-700 dark:active:bg-blue-900/40 dark:md:hover:bg-blue-900/30'
      }`}
      title="Nhấn chạm (Click/Tap) để sửa trực tiếp"
    >
      <div className="flex h-8 w-full items-center justify-center">
        <span className="border-b border-dashed border-blue-400/60 pb-[1px] text-lg font-bold group-hover:border-blue-600">
          {(localQuantity !== null
            ? localQuantity
            : quantity || 0
          ).toLocaleString()}
        </span>
      </div>
      <span className="mt-1 flex items-center justify-center gap-1 text-[9.5px] font-medium whitespace-nowrap text-amber-500/90 transition-colors group-hover:text-amber-600 dark:text-amber-400/90">
        <FaLightbulb className="animate-pulse text-[10px]" /> (Nhấn để sửa)
      </span>
    </motion.div>
  );
};
