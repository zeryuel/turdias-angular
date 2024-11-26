import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { Response } from '../../../shared/interfaces/response.interface';
import { Paged } from '../../../shared/interfaces/paged.interface';
import { Page } from '../../../shared/interfaces/page.interface';
import { Kardex } from '../interfaces/kardex.interface';
import { Parameter } from '../../../shared/interfaces/parameter.interface';

@Injectable({
  providedIn: 'root'
})
export class KardexService {
  public httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=ISO-8859-15', 'Accept': 'application/json' })
  }

  private apiUrl: string = environment.apis.logistics + 'kardex/';

  constructor(private http: HttpClient) { }

  public findMoves(resource: Array<Parameter>): Observable<Response<Kardex[]>> {
    return this.http.post<Response<Kardex[]>>(this.apiUrl + 'find_moves', resource, this.httpOptions);
  }
}
