import { State } from "../../shared/interfaces/state.interface";

export interface SettingAuthorizePurchase {
  recordId: number;
  operation: string;
  showButtonPending: boolean;
  showButtonAuthorize: boolean;
  showButtonReject: boolean;
  lstState: State[];
}

