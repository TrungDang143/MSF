import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { AuthService } from '../../shared/auth.service';
import { CommonModule } from '@angular/common';
import { PopupService } from '../../shared/popup/popup.service';
import { map } from 'rxjs/internal/operators/map';
import { SocialLoginModule, SocialUser } from '@abacritt/angularx-social-login';

declare var grecaptcha: any;
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    SocialLoginModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginComponent implements AfterViewInit, OnInit {
  constructor(
    private router: Router,
    private apiLogin: LoginService,
    private auth: AuthService,
    private pop: PopupService
  ) {}

  ngOnInit(): void {
    this.auth.logout();
    //callback
    (window as any).handleCredentialResponse = (response: any) => {
      this.loginWithGoogle(response.credential)
    };
  }

  disableLoginBtn = false;

  loginForm: FormGroup = new FormGroup({
    UsernameOrEmail: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(40),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    rememberMe: new FormControl(false),
  });

  popup = {
    header: '',
    content: '',
  };

  login() {
    if (this.loginForm.invalid) {
      this.pop.showOkPopup(
        'Thông báo',
        'Kiểm tra lại thông tin đăng nhập: ' + this.getInvalidControl()
      );
      //this.focusInvalidControl();
      return;
    }

    var token = grecaptcha.getResponse();
    if (!token) {
      this.pop.showOkPopup('Thông báo', 'Vui lòng xác nhận reCAPTCHA!');
      return;
    }

    if (this.disableLoginBtn) return;
    this.disableLoginBtn = true;

    this.auth.checkTokenCaptcha(token).pipe(
      map((isValid) => {
        if (!isValid) {
          this.pop.showOkPopup('Thông báo', 'Token reCaptcha ko hop le!');
        }
        return;
        //window.location.reload();

        // window.location.href = window.location.pathname + '?nocache=' + new Date().getTime();
      })
    );

    this.apiLogin.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.result == '1') {
          console.log('✅ Đăng nhập thành công!', response);
          this.auth.saveUserData(
            response.data.token,
            this.loginForm.get('UsernameOrEmail')?.value,
            response.data.roleID,
            this.loginForm.get('rememberMe')?.value
          );
          this.disableLoginBtn = false;
          this.router.navigate(['/home']);
        } else {
          console.warn('⚠️ Có lỗi logic trong API:', response.message);
          this.pop.showOkPopup('Thông báo', response.message);
          this.disableLoginBtn = false;
        }
      },
      error: (error) => {
        console.error('❌ Gọi API thất bại!', error);
        this.pop.showOkPopup(
          'Thông báo',
          'Không thể kết nối đến server. Vui lòng thử lại sau!'
        );
        this.disableLoginBtn = false;
      },
    });
  }

  getInvalidControl(): string {
    const invalidControl = Object.keys(this.loginForm.controls).find(
      (key) => this.loginForm.controls[key].invalid
    );

    if (invalidControl) {
      const element = document.getElementById(invalidControl);
      if (element) {
        // element.focus();
        return element.id;
      }
    }

    return '###';
  }

  // focusInvalidControl() {
  //   const invalidControl = Object.keys(this.loginForm.controls).find(
  //     (key) => this.loginForm.controls[key].invalid
  //   );

  //   if (invalidControl) {
  //     const element = document.getElementById(invalidControl);
  //     if (element) {
  //       element.focus();
  //     }
  //   }
  // }

  //Chỉ load reCAPTCHA sau khi trang đã render xong
  ngAfterViewInit() {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    const script2 = document.createElement('script');
    script2.src = 'https://accounts.google.com/gsi/client';
    script2.async = true;
    script2.defer = true;
    document.body.appendChild(script2);
  }

  loginWithFacebook() {
    var token = '';

    this.auth
      .signInWithFacebook()
      .then((response) => {
        token = response.authToken;
        if (!token) {
          this.pop.showOkPopup('Lỗi', 'Có lỗi khi lấy token Facebook!');
          return;
        }

        this.apiLogin.loginWithFB(token).subscribe({
          next: (res) => {
            if (res.result == '1') {
              console.log('✅ Đăng nhập thành công! (Facebook)', res);
              this.auth.saveUserData(
                res.data.token,
                res.data.username,
                res.data.roleID,
                true);
              this.router.navigate(['/home']);
            } 
            else {
              console.warn('⚠️ Có lỗi logic trong API (Facebook):', res.message);
              this.pop.showOkPopup('Thông báo', res.message);
            }
          },
          error: (err) => {
            console.error('❌ Gọi API thất bại! (Facebook)', err);
            this.pop.showOkPopup(
              'Thông báo',
              'Không thể kết nối đến server. Vui lòng thử lại sau!'
            );
          },
        });

      })
      .catch((error) => this.pop.showOkPopup('Lỗi kết nối với Facebook', error));
  }

  loginWithGoogle(token: string){
    this.apiLogin.loginWithGG(token).subscribe({
      next: (res) => {
        if (res.result == '1') {
          console.log('✅ Đăng nhập thành công! (Google)', res);
          this.auth.saveUserData(
            res.data.token,
            res.data.username,
            res.data.roleID,
            true
          );
          this.router.navigate(['/home']);
        } 
        else {
          console.warn('⚠️ Có lỗi logic trong API (Google):', res.message);
          this.pop.showOkPopup('Thông báo', res.message);
        }
      },
      error: (err) => {
        console.error('❌ Gọi API thất bại! (Google)', err);
        this.pop.showOkPopup(
          'Thông báo',
          'Không thể kết nối đến server. Vui lòng thử lại sau!'
        );
      },
    });
  }
}
