import { Button, ButtonProps } from 'antd';
import React from 'react';
import { IoReload } from 'react-icons/io5';

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
    <Button
      type="default"
      className={`!border-gray-800 !text-gray-800 transition-colors hover:!border-blue-500 hover:!text-blue-500 dark:!border-gray-400 dark:!text-gray-400 dark:hover:!border-blue-400 dark:hover:!text-blue-400 ${props.className || ''}`}
      icon={<IoReload />}
      onClick={refresh || onClick}
      loading={isLoading !== undefined ? isLoading : props.loading}
      {...props}
    >
      {props.children !== undefined ? props.children : 'Làm mới'}
    </Button>
  );
};

export default RefreshButton;
