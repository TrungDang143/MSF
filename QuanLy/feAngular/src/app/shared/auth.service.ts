import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from './environment';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
  SocialAuthService,
} from '@abacritt/angularx-social-login';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private authService: SocialAuthService
  ) { }

  checkToken(): Observable<boolean> {
    const token =
      localStorage.getItem('token') ?? sessionStorage.getItem('token');
    if (!token) {
      return of(false);
    }

    return this.http.get(environment.baseUrl + 'token/validate-token').pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  // checkTokenCaptcha(captcha: string): Observable<boolean> {
  //   const token = captcha;
  //   if (!token) {
  //     return of(false);
  //   }

  //   return this.http.post(environment.baseUrl + 'token/validate-recaptcha', token).pipe(
  //     map(() => true),
  //     catchError(() => of(false))
  //   );
  // }

  hasPermission(permission: string): boolean {
    let permissions =
      localStorage.getItem('permissions') ||
      sessionStorage.getItem('permissions');
    if (!permissions) return false;

    // Nếu không phải JSON, dùng split
    //const permissions = raw.split(',');
    return permissions.includes(permission);
  }

  saveUserData(token: string, rememberMe: boolean): void {
    // Decode payload từ token
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('payload', payload)
    const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const username = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
    const permissions = payload.permissions
      ? Array.isArray(payload.permissions)
        ? payload.permissions
        : payload.permissions.split(',')
      : [];

    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem('token', token);
    storage.setItem('user', username);
    storage.setItem('role', role);
    storage.setItem('permissions', JSON.stringify(permissions));
  }

  getUser(): string {
    return localStorage.getItem('user') || sessionStorage.getItem('user') || '';
  }

  getRole(): string {
    return localStorage.getItem('role') || sessionStorage.getItem('role') || '';
  }

  getPermissions(): string[] {
    const data =
      localStorage.getItem('permissions') ||
      sessionStorage.getItem('permissions');
    return data ? JSON.parse(data) : [];
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('permissions');
  }

  // signInWithGoogle(): any {
  //   this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  // }

  signInWithFacebook(): Promise<any> {
    return this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  signOut(): void {
    this.authService.signOut();
    this.logout();
  }
}
