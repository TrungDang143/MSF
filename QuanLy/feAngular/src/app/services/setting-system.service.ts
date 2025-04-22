import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingSystemService {

  constructor(private http: HttpClient) { }

  GetPasswordRule(): Observable<any>{
    return this.http.get(environment.baseUrl + "SystemSetting/GetPasswordRule")
  }

  UpdatePasswordRule(minLength:number, passwordRule: any): Observable<any>{
    const body = {
      minLength: minLength,
      passwordRules: passwordRule
    }
    return this.http.post(environment.baseUrl + "SystemSetting/UpdatePasswordRule", body, {headers: environment.headers})
  }

  GetListRole(): Observable<any>{
    return this.http.get(environment.baseUrl + "SystemSetting/GetListRole")
  }

  DeleteRoles(ids: number[]): Observable<any>{
    return this.http.post(environment.baseUrl + "SystemSetting/DeleteRole", {roleIds: ids}, {headers: environment.headers})
  }

  CreateRole(newRole: {roleName: string, description?: string, permissionIds: number[]}): Observable<any>{
    const body = {roleName: newRole.roleName, description: newRole.description, permissionIDs: newRole.permissionIds};
    return this.http.post(environment.baseUrl + "SystemSetting/CreateRole", body, {headers: environment.headers})
  }
}
