import { Province } from './province.interface';

export interface District {
  id: number;
  name: string;

  province: Province;
}
