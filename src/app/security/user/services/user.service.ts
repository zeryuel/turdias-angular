import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { Response } from '../../../shared/interfaces/response.interface';
import { Paged } from '../../../shared/interfaces/paged.interface';
import { Page } from '../../../shared/interfaces/page.interface';
import { User } from '../interfaces/user.interface';
import { UserDto } from '../../../shared/interfaces/userDto.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=ISO-8859-15', 'Accept': 'application/json' })
  }

  private apiUrl: string = environment.apis.security + 'user/';

  constructor(private http: HttpClient) { }

  public login(resource: User): Observable<Response<UserDto>> {
    return this.http.post<Response<UserDto>>(this.apiUrl + 'login', resource, this.httpOptions);
  }

  public insert(resource: User): Observable<Response<string>> {
    return this.http.post<Response<string>>(this.apiUrl + 'insert', resource, this.httpOptions);
  }

  public update(resource: User): Observable<Response<string>> {
    return this.http.post<Response<string>>(this.apiUrl + 'update', resource, this.httpOptions);
  }

  public updatePassword(resource: User): Observable<Response<string>> {
    return this.http.post<Response<string>>(this.apiUrl + 'update_password', resource, this.httpOptions);
  }

  public delete(resource: User): Observable<Response<string>> {
    return this.http.post<Response<string>>(this.apiUrl + 'delete', resource, this.httpOptions);
  }

  public setting(resource: Paged): Observable<Response<any>> {
    return this.http.post<Response<any>>(this.apiUrl + 'setting', resource, this.httpOptions);
  }

  public findById(resource: User): Observable<Response<User>> {
    return this.http.post<Response<User>>(this.apiUrl + 'find_by_id', resource, this.httpOptions);
  }

  public findByPagination(resource: Paged): Observable<Response<Page>> {
    return this.http.post<Response<Page>>(this.apiUrl + 'find_by_pagination', resource, this.httpOptions);
  }
}
