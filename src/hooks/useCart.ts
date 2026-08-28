import { useCallback, useMemo, useReducer } from 'react';
import type { Product } from '../types/product';
import { cartReducer } from '../state/cartReducer';

export function useCart() {
  const [products, dispatch] = useReducer(cartReducer, []);
  const ids = useMemo(() => new Set(products.map((product) => product.id)), [products]);
  const add = useCallback((product: Product) => dispatch({ type: 'add', product }), []);
  const remove = useCallback((productId: string) => dispatch({ type: 'remove', productId }), []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);

  return { products, ids, add, remove, clear };
}



