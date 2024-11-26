import { Resource } from "../../security/resource/interfaces/resource.interface";

export interface UserDto {
  id: number
  name: string
  token: string

  lstApplicationDto: ApplicationDto[];
}

export interface ApplicationDto {
  id: number;
  name: string;

  lstResource: Resource[];
}
