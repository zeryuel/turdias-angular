import { Brand } from "./brand.interface";
import { UnitMeasure } from "./unit-measure.interface";

export interface SettingProduct {
  recordId: number;
  operation: string;
  mainScreen: boolean;
  onlyView: boolean;
  lstBrand: Brand[];
  lstUnitMeasure: UnitMeasure[];
}
