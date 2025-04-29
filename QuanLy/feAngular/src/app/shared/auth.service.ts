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
import { Router } from '@angular/router';
import { PopupService } from './popup/popup.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private authService: SocialAuthService,
    private router: Router
  ) {}

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
    this.resetStorageWithoutTokenStack();
    // Decode payload từ token
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role =
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    const username =
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    const permissions = payload.permissions
      ? Array.isArray(payload.permissions)
        ? payload.permissions
        : payload.permissions.split(',')
      : [];
    const isAdminLogin = payload.isAdminLogin;
    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem('token', token);
    storage.setItem('user', username);
    storage.setItem('role', role);
    storage.setItem('isAdminLogin', isAdminLogin);
    storage.setItem('permissions', JSON.stringify(permissions));
  }

  getUser(): string {
    return localStorage.getItem('user') || sessionStorage.getItem('user') || '';
  }

  getRole(): string {
    return localStorage.getItem('role') || sessionStorage.getItem('role') || '';
  }

  getToken(): string {
    return (
      localStorage.getItem('token') || sessionStorage.getItem('token') || ''
    );
  }

  goBackAdmin():boolean {
    let rememberMe: boolean = localStorage.getItem('token') ? true : false;
    let token: string | null = this.popToken();
    if (token){
      this.saveUserData(token, rememberMe);
      return true;
    }
    else{
      return false;
    }
  }

  loginAsUser():boolean{
    const token = this.getToken();
    return this.pushCurrentToken(token);
  }

  pushCurrentToken(token: string): boolean {
    const stack = JSON.parse(localStorage.getItem('tokenStack') || '[]');
    if(stack.length < 5){
      stack.push(token);
      localStorage.setItem('tokenStack', JSON.stringify(stack));
      return true;
    } else return false;
  }

  popToken(): string | null {
    const stack = JSON.parse(localStorage.getItem('tokenStack') || '[]');
    const lastToken = stack.pop();
    localStorage.setItem('tokenStack', JSON.stringify(stack));
    return lastToken || null;
  }

  canGoBack(): boolean{
    const stack = JSON.parse(localStorage.getItem('tokenStack') || '[]');
    return stack.length > 0 && this.isAdminLogin();
  }

  isAdminLogin(): boolean {
    const isAdmin =
      localStorage.getItem('isAdminLogin') ||
      sessionStorage.getItem('isAdminLogin');
    return isAdmin === 'True';
  }

  getPermissions(): string[] {
    const data =
      localStorage.getItem('permissions') ||
      sessionStorage.getItem('permissions');
    return data ? JSON.parse(data) : [];
  }

  logout(): void {
    this.resetAllStorage();
    this.router.navigate(['/login']);
  }

  resetStorageWithoutTokenStack() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    localStorage.removeItem('isAdminLogin');
    localStorage.removeItem('role');

    sessionStorage.removeItem('role');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('permissions');
    sessionStorage.removeItem('isAdminLogin');
  }

  resetAllStorage(){
    this.resetStorageWithoutTokenStack();
    localStorage.removeItem('tokenStack');
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
