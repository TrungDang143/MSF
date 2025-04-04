import { Component, OnInit } from '@angular/core';
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
import { DataForgotService, ForgotService } from '../../services/forgot.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({
  selector: 'app-validate-code',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './validate-code.component.html',
  styleUrl: './validate-code.component.css',
})
export class ValidateCodeComponent implements OnInit {
  constructor(private router: Router, private pop: PopupService, private apiService: ForgotService, private dataService: DataForgotService) {}
  disableBtn = false;

  userInfo: { username: string; email: string; otp: string } = {
    username: '',
    email: '',
    otp: ''
  };

  ngOnInit(): void {
    if (this.dataService.isUserInfoWithOutOTPValid()) {
      this.userInfo = this.dataService.getCurrentUserInfo() as { username: string; email: string; otp: string };
    } else {
      this.pop.showOkPopup('Thông báo', 'Vui lòng thử lại!');
      this.router.navigate(['/forgot']);
    }
  }

  validateForm: FormGroup = new FormGroup({
    digit1: new FormControl('', [
      Validators.required,
      Validators.pattern('[0-9]'),
    ]),
    digit2: new FormControl('', [
      Validators.required,
      Validators.pattern('[0-9]'),
    ]),
    digit3: new FormControl('', [
      Validators.required,
      Validators.pattern('[0-9]'),
    ]),
    digit4: new FormControl('', [
      Validators.required,
      Validators.pattern('[0-9]'),
    ]),
  });
  moveNext(event: any, nextField: string) {
    if (event.target.value.length === 1) {
      const nextInput = document.querySelector(
        `[formControlName="${nextField}"]`
      ) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  movePrev(event: any, prevField: string) {
    if (event.target.value.length === 0) {
      const prevInput = document.querySelector(
        `[formControlName="${prevField}"]`
      ) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  }

  getInvalidControl():string {
    const invalidControl = Object.keys(this.validateForm.controls).find(
      (key) => this.validateForm.controls[key].invalid
    );

    if (invalidControl) {
      const element = document.getElementById(invalidControl);
      if (element) {
        return element.id;
      }
    }

    return '###';
  }

  getOtpCode() {
    this.userInfo.otp =  (
      this.validateForm.get('digit1')?.value +
      this.validateForm.get('digit2')?.value +
      this.validateForm.get('digit3')?.value +
      this.validateForm.get('digit4')?.value
    );
  }

  validate() {
    if (this.validateForm.invalid){
      this.pop.showOkPopup('Thông báo', 'Kiểm tra lại thông tin: ' + this.getInvalidControl())
      return;
    }

    if(this.disableBtn) return;
    this.disableBtn = true;

    this.getOtpCode();

    this.apiService.verifyOTP(this.userInfo).subscribe({
      next: (res) =>{
        if(res.result == '1')
        {
          this.disableBtn = false;
          this.router.navigate(['/new-password'])
        }else{
          this.disableBtn = false;
          this.pop.showOkPopup('Thông báo', res.message)
        }
      },
      error: (err) =>{
        this.disableBtn = false;
        this.pop.showOkPopup('Thông báo', 'Lỗi hệ thống vui lòng thử lại sau!')
        console.log(err.message);
      }
    })
  }

  isDisabled = false;
  countdown = 0;
  timer: any;

  reSend() {
    if (this.isDisabled) return;

    this.apiService.sendOTP(this.userInfo).subscribe({
      next: (res) =>{
        if(res.result == '1')
        {
          this.pop.showOkPopup('Thông báo', 'Đã gửi mã OTP đến địa chỉ: ' + this.userInfo.email)
        }else{
          this.pop.showOkPopup('Thông báo', res.message)
        }
      },
      error: (err) =>{
        this.pop.showOkPopup('Thông báo', 'Lỗi hệ thống vui lòng thử lại sau!')
        console.log(err.message);
      }
    })

    this.isDisabled = true;
    this.countdown = 60;

    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.timer);
        this.isDisabled = false;
      }
    }, 1000);
  }
}
