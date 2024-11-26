import { Product } from "../../product/interfaces/product.interface";

export interface ServiceOrderDetail {
  id: number;
  idServiceOrder: number;
  amount: number;
  unitValue: number;
  unitTax: number;
  unitPrice: number;

  product: Product;
}
