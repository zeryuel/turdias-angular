import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { Response } from '../../../shared/interfaces/response.interface';
import { Province } from '../interfaces/province.interface';
import { Department } from '../interfaces/department.interface';

@Injectable({
  providedIn: 'root'
})
export class ProvinceService {
  public httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=ISO-8859-15', 'Accept': 'application/json' })
  }

  private apiUrl: string = environment.apis.scale + 'province/';

  constructor(private http: HttpClient) { }

  public findByDepartment(resource: Department): Observable<Response<Province>> {
    return this.http.post<Response<Province>>(this.apiUrl + 'find_by_department', resource, this.httpOptions);
  }
}
