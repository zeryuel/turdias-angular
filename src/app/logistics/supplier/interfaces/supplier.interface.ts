import { EconomicActivity } from "./economic-activity.interface";

export interface Supplier {
  id: number;
  ruc: string;
  reasonSocial: string;
  address: string;
  phoneNumber: string;
  email: string;
  contact: string;

  economicActivity: EconomicActivity;
}

