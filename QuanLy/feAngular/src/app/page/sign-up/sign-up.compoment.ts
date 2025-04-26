import { Component, OnInit } from '@angular/core';
import { Route, Router, RouterLink } from '@angular/router';
import { SignUpService } from '../../services/sign-up.service';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PopupService } from '../../shared/popup/popup.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DividerModule } from 'primeng/divider';
import { PasswordModule } from 'primeng/password';
import { AccountService } from '../../services/account.service';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CommonModule,
    FloatLabelModule,
    DividerModule,
    PasswordModule,
    InputTextModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent implements OnInit {
  constructor(
    private apiSignUp: SignUpService,
    private router: Router,
    private pop: PopupService,
    private apiAccount: AccountService
  ) {}
  ngOnInit(): void {
    this.getPasswordRule();
  }

  disableBtn = false;

  signUpForm: FormGroup = new FormGroup(
    {
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(40),
      ]),
      password: new FormControl('', [
        Validators.required,
        this.passwordRulesValidator(),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      // fullname: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]),
      confirmPassword: new FormControl('', Validators.required),
    },
    { validators: this.matchPassword }
  );

  matchPassword(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // getInvalidControl():string {
  //   const invalidControl = Object.keys(this.signUpForm.controls).find(
  //     (key) => this.signUpForm.controls[key].invalid
  //   );

  //   if (invalidControl) {
  //     const element = document.getElementById(invalidControl);
  //     if (element) {
  //       // element.focus();
  //       return element.id;
  //     }
  //   }

  //   return '###';
  // }

  passwordRules: { settingKey: string; description: string }[] = [];
  minPasswordLength = 6;

  requiredUpper: boolean = true;
  requiredLower: boolean = true;
  requiredDigit: boolean = true;
  requiredSpecial: boolean = true;

  get passwordErrors() {
    const control = this.signUpForm.get('password');
    if (!control) return {};

    // Chỉ hiển thị lỗi nếu người dùng đã chạm vào (touched) hoặc sửa (dirty)
    if (!(control.touched || control.dirty)) return {};

    return control.errors || {};
  }
  get passwordTouched() {
    const control = this.signUpForm.get('password');
    return control?.touched || control?.dirty;
  }

  isTouched(event: AbstractControl) {
    return event?.touched || event?.dirty;
  }

  getPasswordRule() {
    this.apiAccount.GetPasswordRule().subscribe({
      next: (res) => {
        if (res.result == '1') {
          res.data.rulePassword.forEach((element: any) => {
            if (element.settingKey == 'Password.RequireUpper')
              this.requiredUpper = true;
            else if (element.settingKey == 'Password.RequireLower')
              this.requiredLower = true;
            else if (element.settingKey == 'Password.RequireSpecial')
              this.requiredSpecial = true;
            else if (element.settingKey == 'Password.RequireDigit')
              this.requiredDigit = true;
          });

          this.passwordRules = res.data.rulePassword;

          this.minPasswordLength = res.data.minPasswordLength;
        } else {
          this.pop.showOkPopup({ message: 'Lỗi khi lấy password rule!' });
        }
      },
      error: (err) => {
        this.pop.showSysErr();
        console.log(err);
      },
    });
  }

  passwordRulesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;

      if (typeof password !== 'string') return null;

      const errors: ValidationErrors = {};

      if (this.requiredUpper && !/[A-Z]/.test(password)) {
        errors['Password.RequireUpper'] = true;
      }
      if (this.requiredLower && !/[a-z]/.test(password)) {
        errors['Password.RequireLower'] = true;
      }
      if (this.requiredDigit && !/\d/.test(password)) {
        errors['Password.RequireDigit'] = true;
      }
      if (
        this.requiredSpecial &&
        !/[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\/]/.test(password)
      ) {
        errors['Password.RequireSpecial'] = true;
      }
      if (password.length < this.minPasswordLength) {
        errors['Password.MinLength'] = {
          requiredLength: this.minPasswordLength,
          actualLength: password.length,
        };
      }
      console.log('Password Rule Flags:', password);
      console.log('Require Uppercase:', this.requiredUpper);
      console.log('Require Lowercase:', this.requiredLower);
      console.log('Require Digit:', this.requiredDigit);
      console.log('Require Special Character:', this.requiredSpecial);

      return Object.keys(errors).length ? errors : null;
    };
  }

  signup() {
    if (this.signUpForm.invalid) {
      this.pop.showOkPopup({ message: 'Kiểm tra lại thông tin tài khoản' });
      return;
    }

    if (this.disableBtn) return;
    this.disableBtn = true;

    this.apiSignUp.signUp(this.signUpForm.value).subscribe({
      next: (response) => {
        if (response.result == '1') {
          this.pop.showOkPopup({
            message: 'Đăng ký thành công!',
          });
          this.disableBtn = false;
          this.router.navigate(['/login']);
        } else {
          console.warn('⚠️ Có lỗi logic trong API:', response.message);
          this.disableBtn = false;
          this.pop.showOkPopup({
            header: 'Thông báo',
            message: response.message,
          });
        }
      },
      error: (error) => {
        console.error('❌ Gọi API thất bại!', error);
        this.disableBtn = false;
        this.pop.showOkPopup({
          message: 'Không thể kết nối đến server. Vui lòng thử lại sau!',
        });
      },
    });
  }
}
