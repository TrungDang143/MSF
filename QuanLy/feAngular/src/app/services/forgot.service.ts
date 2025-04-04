import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../shared/environment';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class ForgotService {

    constructor(private http: HttpClient) { }

    sendOTP(userInfo: any): Observable<any>{
      const url = environment.baseUrl + 'Forgot/SendOTP';
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
      return this.http.post(url, userInfo, { headers });
    }

    verifyOTP(userInfo: any): Observable<any>{
      const url = environment.baseUrl + 'Forgot/VerifyOTP';
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
      return this.http.post(url, userInfo, { headers });
    }

    changePassword(userInfo: any): Observable<any>{
      const url = environment.baseUrl + 'Forgot/ChangePassword';
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
      return this.http.post(url, userInfo, { headers });
    }
}

@Injectable({
  providedIn: 'root'
})
export class DataForgotService {
  private userInfo = new BehaviorSubject<object>({
    username: '',
    email: '',
    otp: ''
  });
  getUserInfo = this.userInfo.asObservable();

  setUserName(username: string) {
    this.userInfo.next({ ...this.userInfo.value, username });
  }

  setEmail(email: string) {
    this.userInfo.next({ ...this.userInfo.value, email });
  }

  setOtp(otp: string) {
    this.userInfo.next({ ...this.userInfo.value, otp });
  }

  getCurrentUserInfo() {
    return this.userInfo.value;
  }

  isUserInfoWithOutOTPValid(): boolean {
    const { username, email, otp } = this.userInfo.value as { username: string; email: string; otp: string };
    return !!(username && email);
  }
  isUserInfoValid(): boolean {
    const { username, email, otp } = this.userInfo.value as { username: string; email: string; otp: string };
    return !!(username && email && otp);
  }
}
