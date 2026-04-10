import React, { createContext, useContext, useState, useCallback } from 'react';

interface ProductDrawerContextType {
  openProduct: (productId: string) => void;
  selectedProductId: string | null;
  isOpen: boolean;
  close: () => void;
}

const ProductDrawerContext = createContext<ProductDrawerContextType | null>(
  null
);

// eslint-disable-next-line react-refresh/only-export-components
export const useProductDrawer = () => {
  const ctx = useContext(ProductDrawerContext);
  if (!ctx) {
    throw new Error(
      'useProductDrawer must be used within ProductDrawerProvider'
    );
  }
  return ctx;
};

export const ProductDrawerProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  const openProduct = useCallback((productId: string) => {
    setSelectedProductId(productId);
  }, []);

  const close = useCallback(() => {
    setSelectedProductId(null);
  }, []);

  return (
    <ProductDrawerContext.Provider
      value={{
        openProduct,
        selectedProductId,
        isOpen: selectedProductId !== null,
        close
      }}
    >
      {children}
    </ProductDrawerContext.Provider>
  );
};
