import { Brand } from './brand.interface';
import { Category } from './category.interface';
import { UnitMeasure } from './unit-measure.interface';

export interface Product {
  id: number;
  name: string;
  alternativeCode: string;

  category: Category;
  brand: Brand;
  unitMeasure: UnitMeasure;
}
