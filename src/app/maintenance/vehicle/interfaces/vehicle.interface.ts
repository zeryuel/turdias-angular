import { VehicleBrand } from "./vehicleBrand.interface";
import { VehicleModel } from "./vehicleModel.interface";
import { VehicleSuspension } from "./vehicleSuspension.interface";
import { VehicleType } from "./vehicleType.interface";

export interface Vehicle {
  id: number;
  plate: string;
  name: string;
  weight: number;
  yearProduction: number;
  mileage: number;
  numberAxles: string;
  active: number;

  vehicleType: VehicleType;
  vehicleBrand: VehicleBrand;
  vehicleModel: VehicleModel;
  vehicleSuspension: VehicleSuspension;
}







