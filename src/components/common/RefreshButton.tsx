import { useStore } from '@tanstack/react-store';
import { Button, Tooltip } from 'antd';
import React from 'react';

import { uiStore } from '@stores/uiStore';

import { IoReload } from 'react-icons/io5';

interface RefreshButtonProps {
  refresh: () => void;
  isLoading: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  refresh,
  isLoading
}) => {
  const { isMobile } = useStore(uiStore);

  return (
    <Tooltip title="Làm mới">
      <Button
        color="primary"
        variant="solid"
        icon={<IoReload />}
        size="large"
        onClick={() => refresh()}
        loading={isLoading}
      >
        {!isMobile && <>Làm mới</>}
      </Button>
    </Tooltip>
  );
};

export default RefreshButton;
