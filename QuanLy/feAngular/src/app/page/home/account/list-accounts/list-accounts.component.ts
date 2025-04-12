import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  Account,
  AccountDetail,
} from '../../../../model/account/account.model';
import { AccountService } from '../../../../services/account.service';
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
import { PopupService } from '../../../../shared/popup/popup.service';
import {
  ImageCropperComponent,
  ImageCroppedEvent,
  LoadedImage,
} from 'ngx-image-cropper';
import { AuthService } from '../../../../shared/auth.service';

@Component({
  selector: 'app-list-accounts',
  imports: [
    NgFor,
    NgIf,
    NgClass,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    FloatLabelModule,
    DatePickerModule,
    SelectModule,
    ImageModule,
    MessageModule,
    InplaceModule,
    ReactiveFormsModule,
    FileUploadModule,
    ImageCropperComponent,
  ],
  templateUrl: './list-accounts.component.html',
  styleUrl: './list-accounts.component.css',
})
export class ListAccountsComponent implements OnInit {
  constructor(
    private apiAccount: AccountService,
    private pop: PopupService,
    private authService: AuthService
  ) {}

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  listAdmin: Account[] = [];
  listSubAdmin: Account[] = [];
  listUser: Account[] = [];

  genders = [];
  roles = [];
  status = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.apiAccount.GetAllUserAccount().subscribe({
      next: (res) => {
        this.listAdmin = res.data.admins;
        this.listSubAdmin = res.data.subAdmins;
        this.listUser = res.data.users;
      },
      error: (err) => {
        if (err.status === 403) {
          // Không có quyền
          this.pop.showOkPopup({
            message: 'Bạn không có quyền truy cập chức năng này.',
          });
          // Option: redirect
          // this.router.navigate(['/unauthorized']);
        } else {
          this.pop.showOkPopup({ message: 'Lỗi lấy danh sách users' });
        }
      },
    });
  }
  displayDetail: boolean = false;

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
    createdAt: new FormControl(null),
    updatedAt: new FormControl(null),
    googleID: new FormControl(null),
    facebookID: new FormControl(null),
    otp: new FormControl(null),
    roleID: new FormControl(null),
    lockTime: new FormControl(null),
    remainTime: new FormControl(null),
  });

  viewDetail(id: any) {
    this.apiAccount.GetDetailUserInfo(id).subscribe({
      next: (res) => {
        this.displayDetail = true;
        const data = res.data;
        this.genders = data.listGender;
        this.roles = data.listRole;
        this.status = data.listStatus;
        this.detailAccountForm.patchValue(data);

        var dateOfBirth: Date | null;
        if (data.dateOfBirth) {
          dateOfBirth = this.parseDateFromString(data.dateOfBirth);
          this.detailAccountForm.patchValue({ dateOfBirth: dateOfBirth });
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

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

  newAvatarBase64: string = '';

  selectAvatar(event: any) {
    const file: File = event.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file); // Chuyển file sang base64
    reader.onload = () => {
      this.newAvatarBase64 = reader.result as string;
      this.detailAccountForm.patchValue({ avatar: this.newAvatarBase64 });
    };
  }

  disabledBtnSave = false;

  save() {
    if (!this.detailAccountForm.valid) {
      this.pop.showOkPopup({
        message: 'Vui lòng kiểm tra lại thông tin user!',
      });
      return;
    } else {
      this.pop.showYesNoPopup({
        header: 'Xác nhận',
        message: 'Bạn có chắc chắn muốn cập nhật user này?',
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
          this.displayDetail = false;
          this.loadData();
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

  closeDialog() {
    //fileUpload.clear();
    this.displayDetail = false;
  }
  deleteUser(userID: number) {
    this.pop.showYesNoPopup({
      message: 'Xác nhận xoá user này?',
      onAccept: () => {
        this.acceptDelete(userID);
      },
    });
  }
  acceptDelete(userID: number) {
    this.apiAccount.DeleteUser(userID).subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.pop.showOkPopup({ message: 'Xoá thành công!' });
          this.displayDetail = false;
          this.loadData();
        } else {
          this.pop.showOkPopup({ message: 'Lỗi khi xoá user!' });
        }
      },
      error: (err) => {
        if (err.status === 403) {
          this.pop.showOkPopup({ message: 'Bạn không có quyền này!' });
        } else this.pop.showOkPopup({ message: 'Lỗi kết nối đến server!' });
        console.log(err);
      },
    });
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
