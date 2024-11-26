import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Parameter } from '../../shared/interfaces/parameter.interface';
import { environment } from '../../../../environments/environment';
import { Paged } from '../../../shared/interfaces/paged.interface';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  public httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=ISO-8859-15', 'Accept': 'application/json' })
  }

  private apiUrl: string = environment.apis.logistics + 'reports/';

  constructor(private http: HttpClient) { }

  public purchase(resource: Paged): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'purchase', resource, this.httpOptions)
  }

  public proof(resource: Paged): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'proof', resource, this.httpOptions)
  }

  public expense(resource: Paged): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'expense', resource, this.httpOptions)
  }

  public entry(resource: Paged): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'entry', resource, this.httpOptions)
  }

  public departure(resource: Paged): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'departure', resource, this.httpOptions)
  }

  public products(): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'products', this.httpOptions)
  }

  public inventoryByWarehouse(resource: Array<Parameter>): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'inventory_by_warehouse', resource, this.httpOptions)
  }
}
