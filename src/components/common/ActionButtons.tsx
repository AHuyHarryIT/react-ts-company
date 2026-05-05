import React from 'react';
import { ButtonProps } from 'antd';
import { motion } from 'framer-motion';
import {
  IconEdit,
  IconDelete,
  IconRestore,
  IconPrint
} from '@components/icons';
import AppButton from '@components/common/AppButton';
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
      <AppButton tone="primary" type="default" icon={<IconEdit />} {...props}>
        {props.children !== undefined ? props.children : 'Cập nhật'}
      </AppButton>
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
      <AppButton tone="danger" type="default" icon={<IconDelete />} {...props}>
        {props.children !== undefined ? props.children : 'Xóa'}
      </AppButton>
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
      <AppButton
        tone="warning"
        type="default"
        icon={<IconRestore />}
        {...props}
      >
        {props.children !== undefined ? props.children : 'Khôi phục'}
      </AppButton>
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
      <AppButton tone="info" type="default" icon={<FaEye />} {...props}>
        {props.children !== undefined ? props.children : 'Chi tiết'}
      </AppButton>
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
      <AppButton tone="primary" type="default" icon={<IconPrint />} {...props}>
        {props.children !== undefined ? props.children : 'IN'}
      </AppButton>
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
      <AppButton tone="danger" type="default" icon={<FaBan />} {...props}>
        {props.children !== undefined ? props.children : 'Từ chối'}
      </AppButton>
    </motion.div>
  );
};
