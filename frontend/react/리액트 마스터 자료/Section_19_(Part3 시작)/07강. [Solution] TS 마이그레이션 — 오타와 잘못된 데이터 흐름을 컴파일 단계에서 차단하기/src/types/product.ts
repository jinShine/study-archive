/* [File Path]: src/types/product.ts
   [Copyright]: © nhcodingstudio 소유 */
export interface ProductState {
  productId: number;
  price: number;
}
export type ProductAction =
  | { type: 'SET_PRODUCT'; payload: number }
  | { type: 'UPDATE_PRICE'; payload: number };
