import { Product } from "../../product/interfaces/product.interface";

export interface DepartureOrderDetail {
  id: number;
  idDepartureOrder: number;
  idEntryOrderDetail: number;
  stock: number;
  amount: number;
  unitValue: number;

  product: Product;
}
