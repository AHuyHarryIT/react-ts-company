import { Link } from '@tanstack/react-router';
import { Button, Flex } from 'antd';
import React from 'react';

import { IconEdit } from '@components/icons';
import { ConfirmButton } from '@components/ui/CRUD/ConfirmButton';
import { productService } from '@services/ProductService';

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
      <ConfirmButton
        id={productId}
        service={productService}
        content="Bạn có chắc chắn muốn xóa sản phẩm này không?"
      />
    </Flex>
  );
};
