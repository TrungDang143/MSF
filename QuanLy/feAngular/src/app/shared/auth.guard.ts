import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PopupService } from './popup/popup.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private pop: PopupService) {}

  canActivate(): Observable<boolean> {
    return this.authService.checkToken().pipe(
      map(isValid => {
        if (!isValid) {
          this.pop.showOkPopup({
            message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!',
            header: 'Thông báo'
          });
          this.router.navigate(['/login']); // Chuyển hướng nếu token không hợp lệ
          console.log("token ko hop le");
          return false;
        }
        return true;
      })
    );
  }
}
