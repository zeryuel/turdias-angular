import { Application } from "../../application/interfaces/application.interface";
import { Resource } from "../../resource/interfaces/resource.interface";

export interface SettingRole {
  recordId: number;
  operation: string;
  mainScreen: boolean;
  onlyView: boolean;
  lstApplication: Application[];
  lstResource: Resource[];
  lstResourceApp: Resource[];
}
