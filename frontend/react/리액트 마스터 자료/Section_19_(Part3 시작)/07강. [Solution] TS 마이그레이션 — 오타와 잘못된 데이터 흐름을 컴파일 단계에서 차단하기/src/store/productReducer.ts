/* [File Path]: src/store/productReducer.ts
   [Copyright]: © nhcodingstudio 소유 */
import type { ProductState, ProductAction } from '../types/product';
export function productReducer(state: ProductState, action: ProductAction): ProductState {
  switch (action.type) {
    case 'SET_PRODUCT': return { ...state, productId: action.payload };
    case 'UPDATE_PRICE': return { ...state, price: action.payload };
    default: return state;
  }
}
