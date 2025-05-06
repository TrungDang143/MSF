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

  GetAllUserAccount(): Observable<any>{
    const url = environment.baseUrl + "Account/GetAllUserAccounts"
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get(url, { headers });
  }

  GetAllRole(): Observable<any>{
    return this.http.get(environment.baseUrl + "Account/GetAllRole")
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

  UpdateUserRoles(userID: number, rolePermissions: any):Observable<any>{
    const body = {userID, rolePermissions}
    return this.http.post(environment.baseUrl + "Account/UpdateUserRoles", body)
  }
}
