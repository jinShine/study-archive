/* [Copyright]: © nhcodingstudio 소유 */
import { create } from 'zustand';
import type { DepartmentStore } from './types';
import { createCosmeticsSlice } from './cosmeticsSlice';
import { createClothingSlice } from './clothingSlice';

export const useDepartmentStore = create<DepartmentStore>()((...a) => ({
  ...createCosmeticsSlice(...a),
  ...createClothingSlice(...a),
}));