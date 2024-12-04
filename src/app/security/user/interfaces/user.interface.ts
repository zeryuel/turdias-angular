import { UserApplication } from "./user-application.interface";

export interface User {
  id: number;
  name: string;
  login: string;
  password: string;
  token: string;

  lstUserApplication: UserApplication[];
}

