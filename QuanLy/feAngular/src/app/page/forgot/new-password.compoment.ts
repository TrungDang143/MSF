import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { PopupService } from '../../shared/popup/popup.service';
import { DataForgotService, ForgotService } from '../../services/forgot.service';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.css',
})
export class NewPasswordComponent implements OnInit {

  constructor(private router: Router, private pop: PopupService, private apiService: ForgotService, private dataService: DataForgotService){}

  disableBtn = false;

  userInfo = {
    username: '',
    password: 'DefaultPassword'
  }

  ngOnInit(): void {
    if (this.dataService.isUserInfoWithOutOTPValid()) {
      this.userInfo.username = (this.dataService.getCurrentUserInfo() as { username: string; email: string; otp: string }).username;
    } else {
      this.pop.showOkPopup({message: 'Vui lòng thử lại!'});
      this.router.navigate(['/forgot']);
    }
  }

  newPwForm: FormGroup = new FormGroup(
    {
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      confirmPassword: new FormControl('', Validators.required),
    },
    { validators: this.matchPassword }
  );

  get password() {
    return this.newPwForm.get('password');
  }

  get confirmPassword() {
    return this.newPwForm.get('confirmPassword');
  }

  matchPassword(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  getInvalidControl():string {
    const invalidControl = Object.keys(this.newPwForm.controls).find(
      (key) => this.newPwForm.controls[key].invalid
    );

    if (invalidControl) {
      const element = document.getElementById(invalidControl);
      if (element) {
        return element.id;
      }
    }

    return '###';
  }

  onSubmit() {
    if (this.newPwForm.invalid){
      this.pop.showOkPopup({message: 'Kiểm tra lại thông tin: ' + this.getInvalidControl()})
      return;
    }

    if(this.disableBtn) return;
    this.disableBtn = true;

    this.userInfo.password = this.password?.value || 'DefaultPassword';

    this.apiService.changePassword(this.userInfo).subscribe({
      next: (res) =>{
        if(res.result == '1')
        {
          this.disableBtn = false;
          this.pop.showOkPopup({message: 'Thay đổi mật khẩu thành công'});
          this.router.navigate(['/login']);
        }else{
          this.disableBtn = false;
          this.pop.showOkPopup({message: res.message});
        }
      },
      error: (err) =>{
        this.disableBtn = false;
        this.pop.showOkPopup({message:'Lỗi hệ thống vui lòng thử lại sau!'})
        console.log(err.message);
      }
    })
  }
}
