import { Currency } from '../../shared/interfaces/currency.interface';
import { PaymentMethod } from '../../shared/interfaces/payment-method.interface';
import { ProofPaymentType } from '../../shared/interfaces/proof-payment-type.interface';
import { State } from '../../shared/interfaces/state.interface';

export interface SettingPurchaseOrder {
  recordId: number;
  recordId2: number;
  operation: string;
  mainScreen: boolean;
  onlyView: boolean;
  currencyAcronym: string;
  taxValue: number;
  stateId: number;
  filterSupplier: string;
  filterRangeDate: Date[];
  lstProofPaymentType: ProofPaymentType[];
  lstPaymentMethod: PaymentMethod[];
  lstCurrency: Currency[];
  lstState: State[];
}
