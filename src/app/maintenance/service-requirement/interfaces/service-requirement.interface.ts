import { Vehicle } from '../../vehicle/interfaces/vehicle.interface';

export interface ServiceRequirement {
  idPersonal: number;
  id: number;
  description: string;
  date: string;
  personalDocumentNumber: number;
  personalFullName: string;

  vehicle: Vehicle;
  state: State;
}

interface State {
  id: number;
  name: string;
}
