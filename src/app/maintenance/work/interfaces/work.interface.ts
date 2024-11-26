import { Brand } from "../../../logistics/product/interfaces/brand.interface";
import { Category } from "../../../logistics/product/interfaces/category.interface";
import { UnitMeasure } from "../../../logistics/product/interfaces/unit-measure.interface";

export interface Work {
  id: number;
  name: string;
  alternativeCode: string;
  active: number;
  category: Category;
  brandrand: Brand;
  unitMeasure: UnitMeasure;
}
