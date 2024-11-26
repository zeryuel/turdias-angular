import { Month } from "../../shared/interfaces/month.interface";
import { State } from "../../shared/interfaces/state.interface";

export interface Period {
  id: number;
  year: number;
  closeDate: Date;
  processDate: Date;

  month: Month;
  state: State;
}
