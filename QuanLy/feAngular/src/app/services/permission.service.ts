import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private http: HttpClient) { }

  GetAllPermission(): Observable<any>{
    return this.http.get(environment.baseUrl + 'Permission/GetAllPermission')
  }

  GetPermissionByRoleIds(roleIds: number[]): Observable<any>{
    return this.http.post(environment.baseUrl + "Permission/GetPermissionByRoleIds", {roleIds});
  }
  GetPermissionForUserByRoleIds(userID: number, roleIds: number[]): Observable<any>{
    const params = new HttpParams()
                  .set('userID', userID)
                  .set('roleIds', roleIds.join(','))
    return this.http.get(environment.baseUrl + "Permission/GetPermissionForUserByRoleIds", {params});
  }
}
