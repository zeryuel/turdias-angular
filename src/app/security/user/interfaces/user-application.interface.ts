import { UserApplicationRole } from "./user-application-role.interface";

export interface UserApplication {
  idUser: number;
  idApplication: number;
  access: number;

  userName: string;
  applicationName: string;

  lstUserApplicationRole: UserApplicationRole[];
}
