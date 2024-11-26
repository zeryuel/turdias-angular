import { CivilState } from "../../shared/interfaces/civil-state.interface";
import { Country } from "../../shared/interfaces/country.interface";
import { DocumentType } from "../../shared/interfaces/document-type.interface";
import { Gender } from "../../shared/interfaces/gender.interface";

export interface SettingPersonal {
  recordId: number;
  operation: string;
  mainScreen: boolean;
  onlyView: boolean;
  lstDocumentType: DocumentType[];
  lstCivilState: CivilState[];
  lstGender: Gender[];
  lstCountry: Country[];
}
