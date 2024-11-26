import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { Response } from '../../../shared/interfaces/response.interface';
import { Province } from '../interfaces/province.interface';
import { District } from '../interfaces/district.interface';

@Injectable({
  providedIn: 'root'
})
export class DistrictService {
  public httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=ISO-8859-15', 'Accept': 'application/json' })
  }

  private apiUrl: string = environment.apis.scale + 'district/';

  constructor(private http: HttpClient) { }

  public findByProvince(resource: Province): Observable<Response<District>> {
    return this.http.post<Response<District>>(this.apiUrl + 'find_by_province', resource, this.httpOptions);
  }
}
