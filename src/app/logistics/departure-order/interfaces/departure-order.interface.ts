import { Authorizer } from "../../authorizer/interfaces/authorizer.interface";
import { CostCenter } from "../../cost-center/interfaces/cost-center.interface";
import { OperationType } from "../../shared/interfaces/operation-type.interface";
import { Personal } from "../../shared/interfaces/personal.interface";
import { ProofPaymentType } from "../../shared/interfaces/proof-payment-type.interface";
import { State } from "../../shared/interfaces/state.interface";
import { DepartureOrderDetail } from "./departure-order-detail.interface";

export interface DepartureOrder {
  id: number;
  idEntryOrder: number | null;
  idWorkOrder: number | null;
  date: string;
  observation: string;
  lstDepartureOrderDetail: DepartureOrderDetail[];

  proofPaymentType: ProofPaymentType;
  operationType: OperationType;
  originCostCenter: CostCenter;
  destinyCostCenter: CostCenter;
  personal: Personal;
  authorizer: Authorizer;
  state: State;
}
