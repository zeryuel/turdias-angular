import { CostCenterType } from "./cost-center-type.interface";

export interface SettingCostCenter {
  recordId: number;
  operation: string;
  mainScreen: boolean;
  onlyView: boolean;
  lstCostCenterType: CostCenterType[];
}
