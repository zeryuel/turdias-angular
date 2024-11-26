import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { Response } from '../../../shared/interfaces/response.interface';
import { Paged } from '../../../shared/interfaces/paged.interface';
import { Page } from '../../../shared/interfaces/page.interface';
import { Personal } from '../interfaces/personal.interface';

@Injectable({
  providedIn: 'root'
})
export class PersonalService {
  public httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=ISO-8859-15', 'Accept': 'application/json' })
  }

  private apiUrl: string = environment.apis.scale + 'personal/';

  constructor(private http: HttpClient) { }

  public insert(resource: Personal): Observable<Response<Personal>> {
    return this.http.post<Response<Personal>>(this.apiUrl + 'insert', resource, this.httpOptions);
  }

  public update(resource: Personal): Observable<Response<Personal>> {
    return this.http.post<Response<Personal>>(this.apiUrl + 'update', resource, this.httpOptions);
  }

  public delete(resource: Personal): Observable<Response<string>> {
    return this.http.post<Response<string>>(this.apiUrl + 'delete', resource, this.httpOptions);
  }

  public setting(resource: Paged): Observable<Response<any>> {
    return this.http.post<Response<any>>(this.apiUrl + 'setting', resource, this.httpOptions);
  }

  public findById(resource: Personal): Observable<Response<Personal>> {
    return this.http.post<Response<Personal>>(this.apiUrl + 'find_by_id', resource, this.httpOptions);
  }

  public findByPagination(resource: Paged): Observable<Response<Page>> {
    return this.http.post<Response<Page>>(this.apiUrl + 'find_by_pagination', resource, this.httpOptions);
  }
}
