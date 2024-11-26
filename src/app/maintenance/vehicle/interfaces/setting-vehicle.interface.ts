import { VehicleBrand } from "./vehicleBrand.interface";
import { VehicleModel } from "./vehicleModel.interface";
import { VehicleSuspension } from "./vehicleSuspension.interface";
import { VehicleType } from "./vehicleType.interface";

export interface SettingVehicle {
  recordId: number;
  operation: string;
  mainScreen: boolean;
  onlyView: boolean;
  lstVehicleType: VehicleType[];
  lstVehicleModel: VehicleModel[];
  lstVehicleBrand: VehicleBrand[];
  lstVehicleSuspension: VehicleSuspension[];
}
