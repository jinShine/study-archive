/* [Copyright]: © nhcodingstudio 소유 */
export interface CosmeticsSlice { perfumeStock: number; sellPerfume: () => void; }
export interface ClothingSlice { shirtStock: number; sellShirt: () => void; }
export interface DepartmentStore extends CosmeticsSlice, ClothingSlice {}