import { StateType } from "./state-type.interface";

export interface State {
  id: number;
  name: string;
  icon: string;
  color: string;
  active: number;

  stateType: StateType;
}
