import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { Response } from '../../../shared/interfaces/response.interface';
import { Parameter } from '../interfaces/parameter.interface';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  public httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=ISO-8859-15', 'Accept': 'application/json' })
  }

  private apiUrl: string = environment.apis.maintenance + 'reports/';

  constructor(private http: HttpClient) { }

  public reportIncidence(resource: Array<Parameter>): Observable<Response<any>> {
    return this.http.post<Response<any>>(this.apiUrl + 'report-incidence', resource, this.httpOptions)
  }

  public reportWorkOrder(resource: Array<Parameter>): Observable<Response<any>> {
    return this.http.post<Response<any>>(this.apiUrl + 'report-work-order', resource, this.httpOptions)
  }

  public reportMaintenancePlan(resource: Array<Parameter>): Observable<Response<any>> {
    return this.http.post<Response<any>>(this.apiUrl + 'report-maintenance-plan', resource, this.httpOptions)
  }

  public reportMechanic(resource: Array<Parameter>): Observable<Response<any>> {
    return this.http.post<Response<any>>(this.apiUrl + 'report-mechanic', resource, this.httpOptions)
  }

  public reportWork(resource: Array<Parameter>): Observable<Response<any>> {
    return this.http.post<Response<any>>(this.apiUrl + 'report-work', resource, this.httpOptions)
  }

  public reportVehicle(resource: Array<Parameter>): Observable<Response<any>> {
    return this.http.post<Response<any>>(this.apiUrl + 'report-vehicle', resource, this.httpOptions)
  }
}
