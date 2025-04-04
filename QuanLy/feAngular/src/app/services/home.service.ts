import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../shared/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  constructor(private http: HttpClient) {}

  getFullName(): Observable<any> {
    var username = localStorage.getItem('user') ?? sessionStorage.getItem('user');
    const params = new HttpParams()
    .set('UsernameOrEmail', username!)
    return this.http.get(environment.baseUrl + 'Home/GetFullName', {params});
  }
}
