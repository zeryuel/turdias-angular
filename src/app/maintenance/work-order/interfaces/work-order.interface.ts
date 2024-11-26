import { Vehicle } from '../../vehicle/interfaces/vehicle.interface';
import { Work } from '../../work/interfaces/work.interface';
import { Mechanic } from '../../mechanic/interfaces/mechanic.interface';

export interface WorkOrder {
  id: number;
  idServiceRequirement: number;
  date: string;
  mileage: number;
  engineHours: number;
  observation: string;

  vehicle: Vehicle;
  workOrderType: WorkOrderType
  workOrderOrigin: WorkOrderOrigin;
  state: State;

  lstWorkOrderDetail: WorkOrderDetail[];
}

export interface WorkOrderDetail {
  id: number;
  idWorkOrder: number;
  startTime: string;
  endTime: string;

  diagnosticMechanic: Mechanic;
  mechanic: Mechanic;
  work: Work;
}

interface WorkOrderType {
  id: number;
  name: string;
}

interface WorkOrderOrigin {
  id: number;
  name: string;
}

interface State {
  id: number;
  name: string;
}

