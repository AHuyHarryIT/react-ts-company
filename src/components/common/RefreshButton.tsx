import { ButtonProps } from 'antd';
import React from 'react';
import { IoReload } from 'react-icons/io5';
import { motion } from 'framer-motion';
import AppButton from '@components/common/AppButton';

interface RefreshButtonProps extends ButtonProps {
  refresh?: () => void;
  isLoading?: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  refresh,
  isLoading,
  onClick,
  ...props
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block"
    >
      <AppButton
        tone="primary"
        type="default"
        {...props}
        className={props.className}
        icon={<IoReload />}
        onClick={refresh || onClick}
        loading={isLoading !== undefined ? isLoading : props.loading}
      >
        {props.children !== undefined ? props.children : 'Làm mới'}
      </AppButton>
    </motion.div>
  );
};

export default RefreshButton;
