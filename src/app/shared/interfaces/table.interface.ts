export interface Table {
  pageNumber: number
  pageSize: number
  orderColumn: number
  hight: number
  totalPages: number
  startElement: number
  endElement: number
  totalElements: number
  content: any[]
  lstColumn: Column[];
  lstPageSize: PageSize[];
  lstPageNumber: PageNumber[];
}

interface Column {
  name: string
  width: string
  style: string
}

interface PageSize {
  id: number
  name: string
}

export interface PageNumber {
  value: string
  style: string
}
