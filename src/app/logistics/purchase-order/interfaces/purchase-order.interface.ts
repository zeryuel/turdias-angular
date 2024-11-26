import { Authorizer } from "../../authorizer/interfaces/authorizer.interface";
import { CostCenter } from "../../cost-center/interfaces/cost-center.interface";
import { Currency } from "../../shared/interfaces/currency.interface";
import { PaymentMethod } from "../../shared/interfaces/payment-method.interface";
import { ProofPaymentType } from "../../shared/interfaces/proof-payment-type.interface";
import { State } from "../../shared/interfaces/state.interface";
import { Supplier } from "../../supplier/interfaces/supplier.interface";
import { PurchaseOrderDetail } from "./purchase-order-detail.interface";

export interface PurchaseOrder {
  id: number;
  idHeadquarters: number;
  purchaseDate: string;
  deliveryDate: string;
  observation: string;
  creditDays: number;
  exchangeRate: number;
  includeTax: number;
  totalItems: number;
  taxValue: number;
  saleValue: number;
  salePrice: number;
  saleTax: number;

  lstPurchaseOrderDetail: PurchaseOrderDetail[];

  proofPaymentType: ProofPaymentType;
  supplier: Supplier;
  authorizer: Authorizer;
  paymentMethod: PaymentMethod;
  currency: Currency;
  state: State;
}
