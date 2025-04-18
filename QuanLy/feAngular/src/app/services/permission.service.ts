import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private http: HttpClient) { }

  getAllPermission(): Observable<any>{
    return this.http.get(environment.baseUrl + 'Permission/GetAllPermission')
  }

  getPermissionByRoleID(roleID: number): Observable<any>{
    const params = new HttpParams().set("RoleID",roleID)
    return this.http.get(environment.baseUrl + "Permission/GetPermissionByRoleID", {params});
  }
}
