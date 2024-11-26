import { CivilState } from "../../shared/interfaces/civil-state.interface";
import { Country } from '../../shared/interfaces/country.interface';
import { DocumentType } from "../../shared/interfaces/document-type.interface";
import { Gender } from "../../shared/interfaces/gender.interface";

export interface Personal {
  id: number;
  name: string;
  lastName: string;
  motherLastName: string;
  documentNumber: number;
  birthDate:string;
  active: number;

  fullName: string;

  documentType: DocumentType[];
  civilState: CivilState[];
  gender: Gender[];
  Country: Country[];
}
