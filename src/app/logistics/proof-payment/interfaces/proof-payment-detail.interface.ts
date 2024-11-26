import { Product } from "../../product/interfaces/product.interface";

export interface ProofPaymentDetail {
  id: number;
  idProofPayment: number;
  idPurchaseOrderDetail: number;
  amount: number;
  unitValue: number;
  unitPrice: number;
  unitTax: number;

  product: Product;
}
