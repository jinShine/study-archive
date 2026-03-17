/* [File Path]: src/utils/taxCalculator.ts
   [Copyright]: © nhcodingstudio 소유 */
import type { ProductState } from '../types/product';
export function taxCalculator(state: ProductState): number {
  return state.productId + 100;
}
