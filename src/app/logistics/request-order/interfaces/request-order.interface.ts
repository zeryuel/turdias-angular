import { State } from "../../shared/interfaces/state.interface";
import { RequestOrderDetail } from "./request-order-detail.interface";

export interface RequestOrder {
  id: number;
  idArea: number;
  date: string;
  observation: string;
  state: State;

  lstRequestOrderDetail: RequestOrderDetail[];
}



