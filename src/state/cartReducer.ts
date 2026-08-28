import type { Product } from '../types/product';

export type CartState = Product[];

export type CartAction =
  | { type: 'add'; product: Product }
  | { type: 'remove'; productId: string }
  | { type: 'clear' };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add':
      return state.some((product) => product.id === action.product.id) ? state : [...state, action.product];
    case 'remove':
      return state.filter((product) => product.id !== action.productId);
    case 'clear':
      return [];
    default:
      return state;
  }
}



