import { CostCenterType } from "./cost-center-type.interface";

export interface CostCenter {
  id: number;
  idDocument: number;
  name: string;

  costCenterType: CostCenterType;
}
