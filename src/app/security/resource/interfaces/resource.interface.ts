import { Application } from "../../application/interfaces/application.interface";
import { ResourceType } from "./resourceType.interface";

export interface Resource {
  id: number;
  idParent: number;
  name: string;
  path: string;
  icon: string;
  position: number;
  isParent: number;

  checked: boolean;

  resourceType: ResourceType;
  application: Application;
}


