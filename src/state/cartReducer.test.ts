import { describe, expect, it } from 'vitest';
import type { Product } from '../types/product';
import { cartReducer } from './cartReducer';

const product: Product = {
  id: 'p-1',
  name: 'Demo product',
  price: 10,
  currency: 'USD',
  imageUrl: '/gapsi-logo.svg'
};

describe('cartReducer', () => {
  it('does not add a duplicate product', () => {
    expect(cartReducer([product], { type: 'add', product })).toEqual([product]);
  });

  it('removes and clears products', () => {
    expect(cartReducer([product], { type: 'remove', productId: product.id })).toEqual([]);
    expect(cartReducer([product], { type: 'clear' })).toEqual([]);
  });
});

