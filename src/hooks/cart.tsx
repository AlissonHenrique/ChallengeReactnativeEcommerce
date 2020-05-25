import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
  splice(): void;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const product = await AsyncStorage.getItem('@itemProduct');
      if (product) {
        setProducts([...JSON.parse(product)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExists = products.find(p => p.id === product.id);

      const quantity = productExists ? productExists.quantity + 1 : 1;

      if (productExists) {
        setProducts(
          products.map(p =>
            p.id === product.id ? { ...product, quantity } : p,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity }]);
      }

      await AsyncStorage.setItem('@itemProduct', JSON.stringify(products));
    },
    [products],
  );
  //   async ({ id, title, image_url, price }) => {
  //     const item = { id, title, image_url, price, quantity: 1 };
  //     setProducts([...products, item]);
  //   },
  //   [products],
  // );

  const increment = useCallback(
    async id => {
      setProducts(
        products.map(product =>
          product.id === id
            ? { ...product, quantity: product.quantity + 1 }
            : product,
        ),
      );

      await AsyncStorage.setItem('@itemProduct', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const prd = products.map(product => {
        if (product.id === id && product.quantity > 0) {
          return { ...product, quantity: product.quantity - 1 };
        }

        return product;
      });

      setProducts(prd);

      await AsyncStorage.setItem('@itemProduct', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
