import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { Response } from '../../../shared/interfaces/response.interface';
import { Paged } from '../../../shared/interfaces/paged.interface';
import { Page } from '../../../shared/interfaces/page.interface';
import { EconomicActivity } from '../interfaces/economic-activity.interface';

@Injectable({
  providedIn: 'root'
})
export class SupplierActivityService {
  public httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=ISO-8859-15', 'Accept': 'application/json' })
  }

  private apiUrl: string = environment.apis.logistics + 'economic-activity/';

  constructor(private http: HttpClient) { }

  public insert(resource: EconomicActivity): Observable<Response<EconomicActivity>> {
    return this.http.post<Response<EconomicActivity>>(this.apiUrl + 'insert', resource, this.httpOptions);
  }

  public update(resource: EconomicActivity): Observable<Response<EconomicActivity>> {
    return this.http.post<Response<EconomicActivity>>(this.apiUrl + 'update', resource, this.httpOptions);
  }

  public delete(resource: EconomicActivity): Observable<Response<string>> {
    return this.http.post<Response<string>>(this.apiUrl + 'delete', resource, this.httpOptions);
  }

  public setting(resource: Paged): Observable<Response<any>> {
    return this.http.post<Response<any>>(this.apiUrl + 'setting', resource, this.httpOptions);
  }

  public findById(resource: EconomicActivity): Observable<Response<EconomicActivity>> {
    return this.http.post<Response<EconomicActivity>>(this.apiUrl + 'find_by_id', resource, this.httpOptions);
  }

  public findByPagination(resource: Paged): Observable<Response<Page>> {
    return this.http.post<Response<Page>>(this.apiUrl + 'find_by_pagination', resource, this.httpOptions);
  }
}
