import { Application } from "../../application/interfaces/application.interface";
import { Resource } from "../../resource/interfaces/resource.interface";
import { RoleResource } from "./role-resource.innterface";

export interface Role {
  id: number;
  name: string;
  active: number;

  application: Application;
  lstRoleResource: RoleResource[];
}

