import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { productService } from "@/services/productService";
import type { Product } from "@/types";

interface ProductContextValue {
  products: Product[];
  loading: boolean;

  refresh: () => Promise<void>;

  createProduct: (
    formData: FormData
  ) => Promise<Product>;

  updateProduct: (
    id: number,
    formData: FormData
  ) => Promise<void>;

  deleteProduct: (
    id: number
  ) => Promise<void>;
}

const ProductContext =
  createContext<
    ProductContextValue | undefined
  >(undefined);

export function ProductProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const refresh = useCallback(
    async () => {
      setLoading(true);

      const data =
        await productService.getProducts();

      setProducts(data);

      setLoading(false);
    },
    []
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createProduct = async (
  formData: FormData
) => {
  const product =
    await productService.createProduct(
      formData
    );

  await refresh();

  return product;
};

 const updateProduct = async (
  id: number,
  formData: FormData
) => {
  await productService.updateProduct(
    id,
    formData
  );

  await refresh();
};
 const deleteProduct = async (
  id: number
) => {
  await productService.deleteProduct(
    id
  );

  await refresh();
};
  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        refresh,
        createProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx =
    useContext(ProductContext);

  if (!ctx) {
    throw new Error(
      "useProducts must be used inside ProductProvider"
    );
  }

  return ctx;
}