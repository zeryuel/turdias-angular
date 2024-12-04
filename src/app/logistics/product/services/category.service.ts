import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { Response } from '../../../shared/interfaces/response.interface';
import { Category } from '../interfaces/category.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  public httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=ISO-8859-15', 'Accept': 'application/json' })
  }

  private apiUrl: string = environment.apis.logistics + 'category/';

  constructor(private http: HttpClient) { }

  public findByIdParent(resource: Category): Observable<Response<Category>> {
    return this.http.post<Response<Category>>(this.apiUrl + 'find_by_id_parent', resource, this.httpOptions);
  }

  public findAllByIdParent(resource: Category): Observable<Response<Category>> {
    return this.http.post<Response<Category>>(this.apiUrl + 'find_all_by_id_parent', resource, this.httpOptions);
  }

}
