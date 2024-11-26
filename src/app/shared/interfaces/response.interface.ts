export interface Response<T> {
  status: string
  type: string
  message: string
  value: T
}
