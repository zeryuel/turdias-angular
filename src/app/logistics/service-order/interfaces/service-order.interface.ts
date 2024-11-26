import { Authorizer } from "../../authorizer/interfaces/authorizer.interface";
import { CostCenter } from "../../cost-center/interfaces/cost-center.interface";
import { Currency } from "../../shared/interfaces/currency.interface";
import { PaymentMethod } from "../../shared/interfaces/payment-method.interface";
import { ProofPaymentType } from "../../shared/interfaces/proof-payment-type.interface";
import { State } from "../../shared/interfaces/state.interface";
import { Supplier } from "../../supplier/interfaces/supplier.interface";
import { ServiceOrderDetail } from "./service-order-detail.interface";

export interface ServiceOrder {
  id: number;
  date: string;
  observation: string;
  creditDays: number;
  taxValue: number;
  saleValue: number;
  salePrice: number;
  saleTax: number;
  lstServiceOrderDetail: ServiceOrderDetail[];

  proofPaymentType: ProofPaymentType;
  supplier: Supplier;
  costCenter: CostCenter;
  authorizer: Authorizer;
  paymentMethod: PaymentMethod;
  currency: Currency;
  state: State;
}
