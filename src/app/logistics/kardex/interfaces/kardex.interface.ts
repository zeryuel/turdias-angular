import { CostCenter } from "../../cost-center/interfaces/cost-center.interface";
import { Product } from "../../product/interfaces/product.interface";
import { Month } from "../../shared/interfaces/month.interface";
import { OperationType } from "../../shared/interfaces/operation-type.interface";
import { ProofPaymentType } from "../../shared/interfaces/proof-payment-type.interface";

export interface Kardex {
  id: number;
  idDocument: number;
  year: number;
  date: string;
  proofSeries: string;
  proofNumber: number;
  entryAmount: number;
  entryUnitCost: number;
  entryTotalCost: number;
  departureAmount: number;
  departureUnitCost: number;
  departureTotalCost: number;
  finalBalanceAmount: number;
  finalBalanceUnitCost: number;
  finalBalanceTotalCost: number;

  proofPaymentType: ProofPaymentType;
  operationType: OperationType;
  originCostCenter: CostCenter;
  destinyCostCenter: CostCenter;
  product: Product;
  month: Month;
}
