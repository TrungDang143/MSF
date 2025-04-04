import { Component } from '@angular/core';
import { Route, Router, RouterLink } from '@angular/router';
import { SignUpService } from '../../services/sign-up.service';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PopupService } from '../../shared/popup/popup.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  constructor(private apiSignUp: SignUpService, private router: Router, private pop: PopupService ){}
  disableBtn = false;
  // today = new Date();
  // minDate = new Date(this.today.getFullYear() - 150, this.today.getMonth(), this.today.getDate()); 
  // maxDate = new Date(this.today.getFullYear() - 18, this.today.getMonth(), this.today.getDate());

  signUpForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(40)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    // fullname: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]),
    confirmPassword: new FormControl('', Validators.required),
  },
  { validators: this.matchPassword })
    // phoneNumber: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(14)]),
    // dateOfBirth: new FormControl('', [Validators.required, this.dateRangeValidator(this.minDate, this.maxDate)]),
    // address: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(120)])

  // dateRangeValidator(min: Date, max: Date) {
  //   return (control: AbstractControl) => {
  //     if (!control.value) return null;

  //     const dateValue = new Date(control.value);
  //     if (dateValue < min) return { min: true };
  //     if (dateValue > max) return { max: true };
  //     return null;
  //   };
  // }

  matchPassword(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  getInvalidControl():string {
    const invalidControl = Object.keys(this.signUpForm.controls).find(
      (key) => this.signUpForm.controls[key].invalid
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

  signup() {
    if (this.signUpForm.invalid){
      this.pop.showOkPopup('Thông báo', 'Kiểm tra lại thông tin tài khoản: ' + this.getInvalidControl())
      return;
    }

    if(this.disableBtn) return;
    this.disableBtn = true;

    this.apiSignUp.signUp(this.signUpForm.value).subscribe({
      next: response =>{
        if (response.result == '1'){
          this.pop.showOkPopup("Thông báo","Đăng ký thành công!");
          this.disableBtn = false;
          this.router.navigate(['/login']);
        }else {
          console.warn('⚠️ Có lỗi logic trong API:', response.message);
          this.disableBtn = false;
          this.pop.showOkPopup("Thông báo", response.message);
        }
      },
      error: error =>{
        console.error('❌ Gọi API thất bại!', error);
        this.disableBtn = false;
        this.pop.showOkPopup("Thông báo", "Không thể kết nối đến server. Vui lòng thử lại sau!");
      }
    })
  }
}
