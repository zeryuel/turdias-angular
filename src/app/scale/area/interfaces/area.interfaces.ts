export interface Area {
  id: number;
  idParent: number;
  name: string;
  path: string;
  isParent: number;
  active: number;

  lstArea: Area[];
}
