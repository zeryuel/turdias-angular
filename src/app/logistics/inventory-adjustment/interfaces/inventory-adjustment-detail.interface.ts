import { Product } from "../../product/interfaces/product.interface";

export interface InventoryAdjustmentDetail {
  id: number;
  idInventoryAdjustment: number;
  amount: number;

  product: Product;
}
