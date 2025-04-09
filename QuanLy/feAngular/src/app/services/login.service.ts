import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../shared/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient) {}

  login(userInfo: any): Observable<any> {
    const url = environment.baseUrl + 'Login';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(url, userInfo, { headers });
  }

  loginWithFB(userInfo: any): Observable<any> {
    const url = environment.baseUrl + 'Login/login-with-facebook';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      url,
      {
        ID: userInfo.ID,
        Fullname: userInfo.Fullname,
        Email: userInfo.Email,
        Avatar: userInfo.Avatar,
      },
      { headers }
    );
  }

  loginWithGG(userInfo: string): Observable<any> {
    const url = environment.baseUrl + 'Login/login-with-google';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, { token: userInfo }, { headers });
  }
}
