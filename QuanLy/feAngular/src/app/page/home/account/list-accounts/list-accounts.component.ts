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
  ],
  templateUrl: './list-accounts.component.html',
  styleUrl: './list-accounts.component.css',
})
export class ListAccountsComponent implements OnInit {
  constructor(private apiAccount: AccountService, private pop: PopupService) {}

  listAdmin: Account[] = [];
  listSubAdmin: Account[] = [];
  listUser: Account[] = [];

  genders = [];
  roles = [];
  status = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){
    this.apiAccount.GetAllUserAccount().subscribe((res) => {
      console.log(res);
      this.listAdmin = res.data.admins;
      this.listSubAdmin = res.data.subAdmins;
      this.listUser = res.data.users;
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
    status: new FormControl(null),
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

  save(fileUpload: any) {
    if(!this.detailAccountForm.valid){
      //this.pop.showOkPopup('Thông báo', 'Vui lòng kiểm tra lại thông tin user!')
      return;
    }

    if(this.disabledBtnSave) return;
    this.disabledBtnSave = true;

    const birht = this.detailAccountForm.get('dateOfBirth');
    if(birht && birht.value){
      let convertDate = this.formatDateToString(birht.value);
      this.detailAccountForm.patchValue({ dateOfBirth: convertDate });
    }
    this.apiAccount.UpdateUser(this.detailAccountForm.getRawValue()).subscribe({
      next: res=>{
        if(res.result == '1'){
          //this.pop.showOkPopup('Thông báo', 'Cập nhật thành công!')
          this.disabledBtnSave = false;
          this.displayDetail = false;
          this.loadData();
        }else{
          //this.pop.showOkPopup('Thông báo', 'Lỗi cập nhật thông tin!')
          this.disabledBtnSave = false;
        }
      },
      error: err =>{
        //this.pop.showOkPopup('Lỗi', 'Không thể kết nối với server!');
        this.disabledBtnSave = false;
        console.log(err.message)
      }
    })
    fileUpload.clear();
  }

  closeDialog(fileUpload: any) {
    fileUpload.clear();
    this.displayDetail = false;
  }

  changeStatus(status: number) {}
}
