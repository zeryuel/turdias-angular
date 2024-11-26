import { CostCenter } from "../../cost-center/interfaces/cost-center.interface";
import { Product } from "../../product/interfaces/product.interface";

export interface Inventory {
  id: number;
  stock: number;
  unitValue: number;
  position: string;

  product: Product;
  costCenter: CostCenter;
}
