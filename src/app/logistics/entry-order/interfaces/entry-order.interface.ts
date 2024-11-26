import { CostCenter } from "../../cost-center/interfaces/cost-center.interface";
import { OperationType } from "../../shared/interfaces/operation-type.interface";
import { ProofPaymentType } from "../../shared/interfaces/proof-payment-type.interface";
import { State } from "../../shared/interfaces/state.interface";
import { EntryOrderDetail } from "./entry-order-detail.interface";

export interface EntryOrder {
  id: number;
  idDocument: number;
  proofSeries: string;
  proofNumber: number;
  date: string;
  observation: string;
  lstEntryOrderDetail: EntryOrderDetail[];

  proofPaymentType: ProofPaymentType;
  operationType: OperationType;
  originCostCenter: CostCenter;
  destinyCostCenter: CostCenter;
  state: State;
}
