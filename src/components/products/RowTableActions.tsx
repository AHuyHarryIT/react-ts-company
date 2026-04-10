import { Link } from '@tanstack/react-router';

import React from 'react';

import { ActionGroup, EditButton } from '@components/common/ActionButtons';
import { ConfirmButton } from '@components/ui/CRUD/ConfirmButton';
import { productService } from '@services/ProductService';

interface RowTableActionsProps {
  productId: string;
}

export const RowTableActions: React.FC<RowTableActionsProps> = ({
  productId
}) => {
  return (
    <ActionGroup>
      <Link to="/admin/products/edit/$id" params={{ id: productId }}>
        <EditButton />
      </Link>
      <ConfirmButton
        id={productId}
        service={productService}
        content="Bạn có chắc chắn muốn xóa sản phẩm này không?"
      />
    </ActionGroup>
  );
};
