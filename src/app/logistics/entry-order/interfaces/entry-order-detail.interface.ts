import { Product } from "../../product/interfaces/product.interface";

export interface EntryOrderDetail {
  id: number;
  idEntryOrder: number;
  idDocumentDetail: number;
  amount: number;
  amountReception: number;
  unitValue: number;

  product: Product;
}
