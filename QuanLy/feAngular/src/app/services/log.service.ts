import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor(private http: HttpClient) { }

  GetAllLog(): Observable<any>{
    const url = environment.baseUrl + "SystemLog/GetLog"
    return this.http.get(url)
  }
}
