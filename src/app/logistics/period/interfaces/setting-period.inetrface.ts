import { Month } from "../../shared/interfaces/month.interface";
import { State } from "../../shared/interfaces/state.interface";

export interface SettingPeriod {
  recordId: number;
  operation: string;
  mainScreen: boolean;
  onlyView: boolean;
  lstMonth: Month[];
  lstState: State[];
}
