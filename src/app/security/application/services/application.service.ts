import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { Response } from '../../../shared/interfaces/response.interface';
import { Paged } from '../../../shared/interfaces/paged.interface';
import { Page } from '../../../shared/interfaces/page.interface';
import { Application } from '../interfaces/application.interface';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  public httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=ISO-8859-15', 'Accept': 'application/json' })
  }

  private apiUrl: string = environment.apis.security + 'application/';

  constructor(private http: HttpClient) { }

  public setting(resource: Paged): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'setting', resource, this.httpOptions);
  }

  public findAll(): Observable<Response<Application[]>> {
    return this.http.post<Response<Application[]>>(this.apiUrl + 'find_all', this.httpOptions);
  }

  public findByPagination(resource: Paged): Observable<Response<Page>> {
    return this.http.post<Response<Page>>(this.apiUrl + 'find_by_pagination', resource, this.httpOptions);
  }
}
