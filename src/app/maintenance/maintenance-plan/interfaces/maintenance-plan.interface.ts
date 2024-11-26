import { Vehicle } from '../../vehicle/interfaces/vehicle.interface';
import { Work } from '../../work/interfaces/work.interface';
export interface MaintenancePlan {
  id: number;
  name: string;
  description: string;
  maintenancePlanDate: string;
  vehicle: Vehicle;
  state: State;

  lstMaintenancePlanDetail: MaintenancePlanDetail[];
}

interface MaintenancePlanDetail {
  id: number;
  amount: number;
  work: Work;
  state: State;
}

interface State {
  id: number;
  name: string;
}
