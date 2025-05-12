import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../shared/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { AuthService } from '../shared/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http: HttpClient) { }

  GetAccounts(filter?: any): Observable<any>{
    const url = environment.baseUrl + "Account/GetAccounts"
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let params = new HttpParams();

  if (filter) {
    if (filter.username) {
      params = params.set('UsernameOrEmail', filter.username);
    }
    if (filter.fullname) {
      params = params.set('Fullname', filter.fullname);
    }
    if (filter.roleID !== null && filter.roleID !== undefined) {
      params = params.set('RoleID', filter.roleID);
    }
    if (filter.permissionID !== null && filter.permissionID !== undefined) {
      params = params.set('PermissionID', filter.permissionID);
    }
    if (filter.pageSize) {
      params = params.set('pageSize', filter.pageSize);
    }
    if (filter.pageNumber) {
      params = params.set('pageNumber', filter.pageNumber);
    }
  }

  return this.http.get(url, { params, headers });
}

  GetRole(rolename?: string): Observable<any>{
    const params = new HttpParams().set("roleName", rolename??'')
    return this.http.get(environment.baseUrl + "Account/GetRole", {params})
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

  GetAllUserPermission(userID: number): Observable<any>{
    const params = new HttpParams().set('userID', userID)
    return this.http.get(environment.baseUrl + "Account/GetAllUserPermission", {params})
  }

  // UpdateUserPermission(userID: number, permissionIDs: number[]): Observable<any>{
  //   const body = {userID: userID, permissionIds: permissionIDs};
  //   return this.http.post(environment.baseUrl + "Account/UpdateUserPermission", body, {headers: environment.headers})
  // }

  GetRoleGenderStatus(): Observable<any>{
    return this.http.get(environment.baseUrl + "Account/GetRoleGenderStatus");
  }

  CreateUser(userInfo: any): Observable<any>{
    return this.http.post(environment.baseUrl + "Account/CreateUser", userInfo, {headers: environment.headers})
  }

  GetPasswordRule():Observable<any>{
    return this.http.get(environment.baseUrl + "Account/GetActivePasswordRule")
  }

  ChangeMyPassword(username: string, oldPassword: string, newPassword: string):Observable<any>{
    const body = {
      "username": username,
      "oldPassword": oldPassword,
      "newPassword": newPassword
    }
    return this.http.post(environment.baseUrl + "Account/ChangeMyPassword", body, {headers: environment.headers});
  }

  ChangeUserPassword(username: string, newPassword: string):Observable<any>{
    const body = {
      "username": username,
      "newPassword": newPassword
    }
    return this.http.post(environment.baseUrl + "Account/ChangeUserPassword", body, {headers: environment.headers});
  }

  LoginAsUser(username: string):Observable<any>{
    const params = {username: username}
    return this.http.get(environment.baseUrl + "Account/LoginUser", {params})
  }

  LogoutUser(username: string):Observable<any>{
    const params = {username: username}
    return this.http.get(environment.baseUrl + "Account/LogoutUser", {params})
  }

  UpdateUserRoles(userID: number, rolePermissions: {roleID: number, unSelectPermissionIds: number[]}[]):Observable<any>{
    let deniedRolePermissionIdsJson = JSON.stringify(rolePermissions)
    const body = {userID, deniedRolePermissionIdsJson}
    return this.http.post(environment.baseUrl + "Account/UpdateUserRoles", body)
  }
}
