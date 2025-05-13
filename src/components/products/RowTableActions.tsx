import { Link } from '@tanstack/react-router';
import { Button, Flex } from 'antd';
import React from 'react';

import { IconDelete, IconEdit } from '@components/icons';

interface RowTableActionsProps {
  productId: string;
}

export const RowTableActions: React.FC<RowTableActionsProps> = ({
  productId
}) => {
  return (
    <Flex gap="small" justify="center">
      <Link to="/admin/products/edit/$id" params={{ id: productId }}>
        <Button variant="solid" color="blue" icon={<IconEdit />}>
          Cập nhật
        </Button>
      </Link>
      <Button
        variant="solid"
        color="red"
        icon={<IconDelete />}
        onClick={() => {
          console.log('Xóa sản phẩm', productId);
        }}
      >
        Xóa
      </Button>
    </Flex>
  );
};
