import { User } from "../../../security/user/interfaces/user.interface";

export interface Authorizer {
  id: number;
  idUser: number;
  name: string;
  maximumValue: number;
  active: number;

  userName: string;
}
