import { Currency } from "../../shared/interfaces/currency.interface";
import { PaymentMethod } from "../../shared/interfaces/payment-method.interface";
import { ProofPaymentType } from "../../shared/interfaces/proof-payment-type.interface";
import { State } from "../../shared/interfaces/state.interface";
import { Supplier } from "../../supplier/interfaces/supplier.interface";
import { ProofPaymentDetail } from "./proof-payment-detail.interface";

export interface ProofPayment {
  id: number;
  idPurchaseOrder: number;
  series: string;
  number: number;
  emissionDate: string;
  expirationDate: string;
  exchangeRate: number;
  creditDays: number;
  taxValue: number;
  saleValue: number;
  salePrice: number;
  saleTax: number;
  lstProofPaymentDetail: ProofPaymentDetail[];

  proofPaymentType: ProofPaymentType;
  supplier: Supplier;
  paymentMethod: PaymentMethod;
  currency: Currency;
  state: State;
}
