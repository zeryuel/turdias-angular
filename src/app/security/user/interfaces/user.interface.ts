import { UserApplication } from "./user-application.interface";

export interface User {
  id: number;
  name: string;
  login: string;
  password: string;
  active: number;
  token: string;

  lstUserApplication: UserApplication[];
}

