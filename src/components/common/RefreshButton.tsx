import { Button } from 'antd';
import React from 'react';

import { IoReload } from 'react-icons/io5';

interface RefreshButtonProps {
  refresh: () => void;
  isLoading: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  refresh,
  isLoading
}) => {
  return (
    <Button
      color="primary"
      variant="solid"
      icon={<IoReload />}
      size="large"
      onClick={() => refresh()}
      loading={isLoading}
    >
      Làm mới
    </Button>
  );
};

export default RefreshButton;
