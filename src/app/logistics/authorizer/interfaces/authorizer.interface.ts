import { User } from "../../../security/user/interfaces/user.interface";

export interface Authorizer {
  id: number;
  idUser: number;
  name: string;
  maximumValue: number;

  userName: string;
}
