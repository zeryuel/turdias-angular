import { CostCenter } from "../../cost-center/interfaces/cost-center.interface";
import { Product } from "../../product/interfaces/product.interface";

export interface PurchaseOrderDetail {
  id: number;
  idPurchaseOrder: number;
  amount: number;
  amountEntry: number;
  amountProof: number;
  unitValue: number;
  unitTax: number;
  unitPrice: number;

  costCenter: CostCenter;
  product: Product;
}
