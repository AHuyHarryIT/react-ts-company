import React from 'react';
import { Drawer } from 'antd';
import { useProductDrawer } from '@/contexts/ProductDrawerContext';
import { ProductDetail } from './ProductDetail';
import { useIsMobile } from '@hooks/useIsMobile';

export const ProductDetailDrawer: React.FC = () => {
  const { isOpen, close, selectedProductId } = useProductDrawer();
  const isMobile = useIsMobile();

  return (
    <Drawer
      title="Chi tiết sản phẩm"
      placement={isMobile ? 'bottom' : 'right'}
      width={isMobile ? '100vw' : '90vw'}
      height={isMobile ? '95vh' : undefined}
      onClose={close}
      open={isOpen}
      destroyOnClose
      styles={{
        body: {
          padding: isMobile ? '12px' : '24px',
          paddingBottom: 80
        }
      }}
    >
      {selectedProductId && <ProductDetail id={selectedProductId} />}
    </Drawer>
  );
};
