export interface Category {
  id: number;
  idParent: number;
  name: string;
  path: string;
  isParent: number;
  active: number;

  lstCategory: Category[];
}