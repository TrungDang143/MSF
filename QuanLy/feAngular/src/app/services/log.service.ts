import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ObservableInput } from 'rxjs';
import { environment } from '../shared/environment';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  constructor(private http: HttpClient) {}

  GetAllLog(): Observable<any> {
    const url = environment.baseUrl + 'SystemLog/GetLog';
    return this.http.get(url);
  }

  GetLogPaging(
    pageSize: number,
    pageNumber: number,
    userName?: string,
    from?: Date | null,
    to?: Date | null
  ): Observable<any> {
    let params = new HttpParams()
      .set('pageSize', pageSize)
      .set('pageNumber', pageNumber);

    if (userName) {
      params = params.set('userName', userName);
    }
    if (from) {
      params = params.set('from', from.toISOString());
    }
    if (to) {
      params = params.set('to', to.toISOString());
    }
    return this.http.get(
      environment.baseUrl + 'SystemLog/GetSystemLogsByPaging',
      { params }
    );
  }

  DeleteLogByIds(ids: number[]): Observable<any>{
    const body = {logIds: ids};
    return this.http.post(environment.baseUrl + "SystemLog/DeleteLogs", body, {headers: environment.headers})
  }
}
