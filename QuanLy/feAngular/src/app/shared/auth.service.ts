import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from './environment';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthService } from '@abacritt/angularx-social-login';

@Injectable({
  providedIn: 'root', 
})
export class AuthService {
  constructor(private http: HttpClient, private authService: SocialAuthService){}

  checkToken(): Observable<boolean> {
    const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
    if (!token) {
      return of(false);
    }

    return this.http.get(environment.baseUrl + 'token/validate-token').pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  checkTokenCaptcha(captcha: string): Observable<boolean> {
    const token = captcha;
    if (!token) {
      return of(false);
    }

    return this.http.post(environment.baseUrl + 'token/validate-recaptcha', token).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  saveUserData(token: string, user: string, roleID: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', user);
      localStorage.setItem('roleID', roleID);
    } else {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', user);
      sessionStorage.setItem('roleID', roleID);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  getUser(): any {
    return JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('roleID');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('roleID');
  }

  // signInWithGoogle(): any {
  //   this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  // }

  signInWithFacebook(): Promise<any> {
    return this.authService.signIn(FacebookLoginProvider.PROVIDER_ID)
  }

  signOut(): void {
    this.authService.signOut();
    this.logout();
    
  }
}
