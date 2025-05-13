import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, EMPTY, throwError } from 'rxjs';
import { PopupService } from './popup/popup.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {

  const auth = inject(AuthService);
  const router = inject(Router);
  const pop = inject(PopupService)
  
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
        router.navigate(['/login']);
        pop.showOkPopup({message: "Vui lòng đăng nhập lại!"})
        return EMPTY;
      }

      if (error.status === 403) {
        pop.showOkPopup({message: "Bạn không có quyền truy cập chức năng này!"})
        return EMPTY;
      }

      return throwError(() => error);
    })
  );
};