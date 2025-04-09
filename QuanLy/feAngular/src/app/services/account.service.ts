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
}
