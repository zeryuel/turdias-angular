import { EconomicActivity } from "./economic-activity.interface";

export interface SettingSupplier {
  recordId: number;
  operation: string;
  mainScreen: boolean;
  onlyView: boolean;
  lstEconomicActivity: EconomicActivity[];
}
