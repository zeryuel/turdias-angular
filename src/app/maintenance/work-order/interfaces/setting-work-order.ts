import { State } from "../../../logistics/shared/interfaces/state.interface";
import { WorkOrderOrigin } from "./work-order-origin.interface";
import { WorkOrdertype } from "./work-order-type.interface";

export interface SettingWorkorder {
  recordId: number;
  recordId2: number;
  operation: string;
  mainScreen: boolean;
  onlyView: boolean;
  stateId: number;
  filterVehicle: string;
  filterRangeDate: Date[];
  lstWorkOrderType: WorkOrdertype[];
  lstWorkOrderOrigin: WorkOrderOrigin[];
  lstState: State[];
}
