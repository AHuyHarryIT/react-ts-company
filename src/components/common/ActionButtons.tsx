import React from 'react';
import { Button, ButtonProps } from 'antd';
import { motion } from 'framer-motion';
import {
  IconEdit,
  IconDelete,
  IconRestore,
  IconPrint
} from '@components/icons';
import { FaEye, FaBan } from 'react-icons/fa';

/**
 * Standard Wrapper to hold action buttons together uniformly (Flex, centered, small gap)
 */
export const ActionGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div
      className={`flex flex-nowrap items-center justify-center gap-2 whitespace-nowrap ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Standard Pre-configured Edit Button
 */
export const EditButton: React.FC<ButtonProps> = (props) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block"
    >
      <Button
        type="default"
        className="!border-gray-800 !text-gray-800 transition-colors hover:!border-blue-500 hover:!text-blue-500 dark:!border-gray-400 dark:!text-gray-400 dark:hover:!border-blue-400 dark:hover:!text-blue-400"
        icon={<IconEdit />}
        {...props}
      >
        {props.children !== undefined ? props.children : 'Cập nhật'}
      </Button>
    </motion.div>
  );
};

/**
 * Standard Pre-configured Delete Button
 */
export const DeleteButton: React.FC<ButtonProps> = (props) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block"
    >
      <Button
        type="default"
        className="!border-gray-800 !text-gray-800 transition-colors hover:!border-red-500 hover:!text-red-500 dark:!border-gray-400 dark:!text-gray-400 dark:hover:!border-red-400 dark:hover:!text-red-400"
        icon={<IconDelete />}
        {...props}
      >
        {props.children !== undefined ? props.children : 'Xóa'}
      </Button>
    </motion.div>
  );
};

/**
 * Standard Pre-configured Restore Button
 */
export const RestoreButton: React.FC<ButtonProps> = (props) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block"
    >
      <Button
        type="default"
        className="!border-gray-800 !text-gray-800 transition-colors hover:!border-amber-500 hover:!text-amber-500 dark:!border-gray-400 dark:!text-gray-400 dark:hover:!border-amber-400 dark:hover:!text-amber-400"
        icon={<IconRestore />}
        {...props}
      >
        {props.children !== undefined ? props.children : 'Khôi phục'}
      </Button>
    </motion.div>
  );
};

/**
 * Standard Pre-configured View Details Button
 */
export const ViewButton: React.FC<ButtonProps> = (props) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block"
    >
      <Button
        type="default"
        className="!border-gray-800 !text-gray-800 transition-colors hover:!border-indigo-500 hover:!text-indigo-500 dark:!border-gray-400 dark:!text-gray-400 dark:hover:!border-indigo-400 dark:hover:!text-indigo-400"
        icon={<FaEye />}
        {...props}
      >
        {props.children !== undefined ? props.children : 'Chi tiết'}
      </Button>
    </motion.div>
  );
};

/**
 * Standard Pre-configured Print Button
 */
export const PrintButton: React.FC<ButtonProps> = (props) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block"
    >
      <Button
        type="default"
        className="!border-gray-800 !text-gray-800 transition-colors hover:!border-blue-500 hover:!text-blue-500 dark:!border-gray-400 dark:!text-gray-400 dark:hover:!border-blue-400 dark:hover:!text-blue-400"
        icon={<IconPrint />}
        {...props}
      >
        {props.children !== undefined ? props.children : 'IN'}
      </Button>
    </motion.div>
  );
};

/**
 * Standard Pre-configured Reject Button
 */
export const RejectButton: React.FC<ButtonProps> = (props) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block"
    >
      <Button
        type="default"
        className="!border-gray-800 !text-gray-800 transition-colors hover:!border-red-500 hover:!text-red-500 dark:!border-gray-400 dark:!text-gray-400 dark:hover:!border-red-400 dark:hover:!text-red-400"
        icon={<FaBan />}
        {...props}
      >
        {props.children !== undefined ? props.children : 'Từ chối'}
      </Button>
    </motion.div>
  );
};
