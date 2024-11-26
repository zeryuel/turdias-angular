import { Department } from './department.interface';

export interface Province {
  id: number;
  name: string;

  department: Department;
}
