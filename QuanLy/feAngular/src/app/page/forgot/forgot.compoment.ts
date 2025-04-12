import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { AuthService } from '../../shared/auth.service';
import { CommonModule } from '@angular/common';
import { PopupService } from '../../shared/popup/popup.service';
import { ApiService } from '../../services/api.service';
import {
  DataForgotService,
  ForgotService,
} from '../../services/forgot.service';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './forgot.component.html',
  styleUrl: './forgot.component.css',
})
export class ForgotComponent {
  constructor(
    private router: Router,
    private pop: PopupService,
    private apiService: ForgotService,
    private dataService: DataForgotService
  ) {}

  disableBtn = false;

  forgotForm: FormGroup = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(40),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  getInvalidControl(): string {
    const invalidControl = Object.keys(this.forgotForm.controls).find(
      (key) => this.forgotForm.controls[key].invalid
    );

    if (invalidControl) {
      const element = document.getElementById(invalidControl);
      if (element) {
        return element.id;
      }
    }

    return '###';
  }

  async send() {
    if (this.forgotForm.invalid) {
      this.pop.showOkPopup(
        {message: 'Kiểm tra lại thông tin: ' + this.getInvalidControl()}
      );
      return;
    }

    if (this.disableBtn) return;
    this.disableBtn = true;

    try {
      const res = await lastValueFrom(
        this.apiService.sendOTP(this.forgotForm.value)
      );

      if (res.result == '1') {
        this.pop.showOkPopup(
          {message: 'Đã gửi mã OTP đến địa chỉ: ' + this.forgotForm.get('email')?.value}
        );
        this.dataService.setEmail(this.forgotForm.get('email')?.value);
        this.dataService.setUserName(this.forgotForm.get('username')?.value);
        this.router.navigate(['/validate-code']);
      } 
      else {
        this.pop.showOkPopup({message: res.message});
      }
    } catch (err: any) {
      this.pop.showOkPopup({message: 'Lỗi hệ thống vui lòng thử lại sau!'});
      console.log(err.message);
    } finally {
      this.disableBtn = false;
    }
  }
}
