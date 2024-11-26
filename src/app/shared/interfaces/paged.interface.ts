export interface Paged {
  pageSize: number;
  pageNumber: number;
  orderColumn: string;
  order: string;

  lstFilter: Filter[];
}

interface Filter {
  object: string;
  column: string;
  value: any;
  operator: string;
}
