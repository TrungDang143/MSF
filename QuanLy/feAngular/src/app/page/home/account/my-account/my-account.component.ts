import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NgModel,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ImageModule } from 'primeng/image';
import { MessageModule } from 'primeng/message';
import { InplaceModule } from 'primeng/inplace';
import { FileUploadModule } from 'primeng/fileupload';
import {
  ImageCropperComponent,
  ImageCroppedEvent,
  LoadedImage,
} from 'ngx-image-cropper';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Page404Service } from '../../../../services/page-404.service';
import { PopupService } from '../../../../shared/popup/popup.service';
import { AccountService } from '../../../../services/account.service';

@Component({
  selector: 'app-my-account',
  imports: [FloatLabelModule,
    DatePickerModule,
    SelectModule,
    ImageModule,
    MessageModule,
    InplaceModule,
    FileUploadModule, ButtonModule, DialogModule, InputTextModule, CommonModule, FormsModule, ReactiveFormsModule, ImageCropperComponent],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.css',
})

export class MyAccountComponent implements OnInit {
  constructor(private http: HttpClient, private page404: Page404Service, private pop: PopupService, private apiAccount: AccountService) {}

  ngOnInit(): void {
    this.getUserInfo();
  }

  getUserInfo() {
    let username = localStorage.getItem('user') ?? sessionStorage.getItem('user');
    this.apiAccount.GetDetailUserInfoByUsername(username!).subscribe({
      next: (res) => {
        const data = res.data;
        this.genders = data.listGender;
        this.detailAccountForm.patchValue(data);

        var dateOfBirth: Date | null;
        if (data.dateOfBirth) {
          dateOfBirth = this.parseDateFromString(data.dateOfBirth);
          this.detailAccountForm.patchValue({ dateOfBirth: dateOfBirth });
        }
        console.log('data', this.detailAccountForm)
      },
      error: (err) => {
        if (err.status === 401) {

        } else if (err.status === 403) {

          this.page404.show404('Bạn không có quyền truy cập trang này!');
        } else {

        }
      },
    });
    
  }

  disabledBtnSave = false;
  genders = [];

  detailAccountForm: FormGroup = new FormGroup({
    userID: new FormControl({ value: 0, disabled: true }),
    username: new FormControl({ value: '', disabled: true }),
    email: new FormControl({ value: '', disabled: true }),
    fullName: new FormControl(null, [Validators.maxLength(100)]),
    phoneNumber: new FormControl(null, [Validators.maxLength(15)]),
    avatar: new FormControl(null),
    dateOfBirth: new FormControl(null),
    gender: new FormControl(null),
    address: new FormControl(null, [Validators.maxLength(100)]),
    statusID: new FormControl(null),
    googleID: new FormControl(null),
    facebookID: new FormControl(null),
    roleID: new FormControl(null),
  });

  parseDateFromString(dateStr: string): Date {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  formatDateToString(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  }
  save() {
    if (!this.detailAccountForm.valid) {
      this.pop.showOkPopup({
        message: 'Vui lòng kiểm tra lại thông tin user!',
      });
      return;
    } else {
      this.pop.showYesNoPopup({
        header: 'Xác nhận',
        message: 'Bạn có chắc chắn muốn cập nhật thông tin?',
        onAccept: () => {
          this.acceptUpdate();
        },
        onReject: () => {
          console.log('huy');
        },
      });
    }
  }

  acceptUpdate() {
    if (this.disabledBtnSave) return;
    this.disabledBtnSave = true;

    const birht = this.detailAccountForm.get('dateOfBirth');
    if (birht && birht.value) {
      let convertDate = this.formatDateToString(birht.value);
      this.detailAccountForm.patchValue({ dateOfBirth: convertDate });
    }
    this.apiAccount.UpdateUser(this.detailAccountForm.getRawValue()).subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.pop.showOkPopup({ message: 'Cập nhật thành công!' });
          this.disabledBtnSave = false;
          this.getUserInfo();
        } else {
          this.pop.showOkPopup({ message: 'Lỗi cập nhật thông tin!' });
          this.disabledBtnSave = false;
        }
      },
      error: (err) => {
        if (err.status === 403) {
          this.pop.showOkPopup({ message: 'Bạn không có quyền này!' });
        } else {
          this.pop.showOkPopup({
            header: 'Lỗi',
            message: 'Không thể kết nối với server!',
          });
          this.disabledBtnSave = false;
          console.log(err.message);
        }
      },
    });
    //fileUpload.clear();
  }

  displayPopupAvatar = false;

  imageChangedEvent: any = '';
  croppedImage: string = '';

  changeAvatar() {
    this.displayPopupAvatar = true;
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64 ?? '';
  }

  imageLoaded() {
    // ảnh load xong
  }

  cropperReady() {
    // cropper sẵn sàng
  }

  loadImageFailed() {
    console.error('Không thể load ảnh');
  }
  submitToServer() {
    // Tạo body hoặc DTO để gửi BE
    this.detailAccountForm.patchValue({ avatar: this.croppedImage });
    this.displayPopupAvatar = false;
  }
}
