import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { Response } from '../../../shared/interfaces/response.interface';
import { Paged } from '../../../shared/interfaces/paged.interface';
import { Page } from '../../../shared/interfaces/page.interface';
import { PurchaseOrder } from '../../purchase-order/interfaces/purchase-order.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthorizePurchaseService {
  public httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=ISO-8859-15', 'Accept': 'application/json' })
  }

  private apiUrl: string = environment.apis.logistics + 'authorize-purchase/';

  constructor(private http: HttpClient) { }

  public pending(resource: Array<PurchaseOrder>): Observable<Response<string>> {
    return this.http.post<Response<string>>(this.apiUrl + 'pending', resource, this.httpOptions);
  }

  public authorize(resource: Array<PurchaseOrder>): Observable<Response<string>> {
    return this.http.post<Response<string>>(this.apiUrl + 'authorize', resource, this.httpOptions);
  }

  public reject(resource: Array<PurchaseOrder>): Observable<Response<string>> {
    return this.http.post<Response<string>>(this.apiUrl + 'reject', resource, this.httpOptions);
  }

  public setting(resource: Paged): Observable<Response<any>> {
    return this.http.post<Response<any>>(this.apiUrl + 'setting', resource, this.httpOptions);
  }

  public findByPagination(resource: Paged): Observable<Response<Page>> {
    return this.http.post<Response<Page>>(this.apiUrl + 'find_by_pagination', resource, this.httpOptions);
  }
}
