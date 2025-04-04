import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../shared/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SignUpService {

  constructor(private http: HttpClient) { 

  }

  signUp(userInfo: any): Observable<any>{
    const url = environment.baseUrl + 'SignUp';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(url, userInfo, { headers });
  }
}
