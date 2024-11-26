import { OperationType } from "../../shared/interfaces/operation-type.interface";
import { ProofPaymentType } from "../../shared/interfaces/proof-payment-type.interface";
import { State } from "../../shared/interfaces/state.interface";

export interface SettingDepartureOrder {
  recordId: number;
  recordId2: number;
  operation: string;
  mainScreen: boolean;
  onlyView: boolean;
  stateId: number;
  filterCostCenter: string;
  filterItem: string;
  filterRangeDate: Date[];
  lstProofPaymentType: ProofPaymentType[];
  lstOperationType: OperationType[];
  lstState: State[];
}
