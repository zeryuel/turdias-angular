import { State } from "../../../logistics/shared/interfaces/state.interface";

export interface SettingServiceRequirement {
  recordId: number;
  operation: string;
  mainScreen: boolean;
  onlyView: boolean;
  stateId: number;
  filterVehicle: string;
  filterPersonal: string;
  filterRangeDate: Date[];
  lstState: State[];
}
