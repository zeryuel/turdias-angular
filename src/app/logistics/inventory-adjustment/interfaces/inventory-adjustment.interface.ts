import { CostCenter } from "../../cost-center/interfaces/cost-center.interface";
import { OperationType } from "../../shared/interfaces/operation-type.interface";
import { ProofPaymentType } from "../../shared/interfaces/proof-payment-type.interface";
import { State } from "../../shared/interfaces/state.interface";
import { InventoryAdjustmentDetail } from "./inventory-adjustment-detail.interface";

export interface InventoryAdjustment {
  id: number;
  date: string;
  observation: string;
  lstInventoryAdjustmentDetail: InventoryAdjustmentDetail[];

  proofPaymentType: ProofPaymentType;
  operationType: OperationType;
  costCenter: CostCenter;
  state: State;
}
