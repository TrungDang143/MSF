import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../shared/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http: HttpClient) { }

  GetAllUserAccount(): Observable<any>{
    const url = environment.baseUrl + "Account/GetAllUserAccounts"
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get(url, { headers });
  }

  GetDetailUserInfo(userid: number): Observable<any>{
    const url = environment.baseUrl + "Account/GetDetailUserInfo"
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('userid', userid)
    return this.http.get(url, { headers, params});
  }

  GetDetailUserInfoByUsername(username: string): Observable<any>{
    const url = environment.baseUrl + "Account/userInfo"
    const params = new HttpParams().set('Username', username)
    return this.http.get(url, { params});
  }

  UpdateUser(userInfo: any): Observable<any>{
    const url = environment.baseUrl + "Account/UpdateUser";
    return this.http.post(url, userInfo);
  }

  DeleteUser(userID: number): Observable<any>{
    const url = environment.baseUrl + "Account/DeleteUser";
    const params = new HttpParams().set('userID', userID)
    return this.http.get(url, {params})
  }
}
