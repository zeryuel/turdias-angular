import { State } from "../../shared/interfaces/state.interface";

export interface SettingRequestOrder {
  recordId: number;
  recordId2: number;
  operation: string;
  mainScreen: boolean;
  onlyView: boolean;
  filterRangeDate: Date[];
  lstState: State[];
}
