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
import { FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ImageModule } from 'primeng/image';
import { MessageModule } from 'primeng/message';
import { InplaceModule } from 'primeng/inplace';

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
    ReactiveFormsModule
  ],
  templateUrl: './list-accounts.component.html',
  styleUrl: './list-accounts.component.css',
})
export class ListAccountsComponent implements OnInit {
  constructor(private apiAccount: AccountService) {}

  listAdmin: Account[] = [];
  listSubAdmin: Account[] = [];
  listUser: Account[] = [];

  genders = ['Male', 'Female', 'No tell'];
  roles = ['Admin', 'Sub-Admin', 'User', 'Guest'];
  status = ['Active', 'Disable'];

  ngOnInit(): void {
    this.apiAccount.GetAllUserAccount().subscribe((res) => {
      console.log(res);
      this.listAdmin = res.data.admins;
      this.listSubAdmin = res.data.subAdmins;
      this.listUser = res.data.users;
    });
  }

  detailAccount: AccountDetail | null = null;
  displayDetail: boolean = false;

  detailAccountForm: FormGroup = new FormGroup({
    userID: new FormControl(0),
    username: new FormControl(''),
    email: new FormControl(''),
    fullName: new FormControl(null),
    phoneNumber: new FormControl(null),
    avatar: new FormControl(null),
    dateOfBirth: new FormControl(null),
    gender: new FormControl(null),
    address: new FormControl(null),
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
    console.log('iddd', id);
    this.apiAccount.GetDetailUserInfo(id).subscribe({
      next: (res) => {
        this.displayDetail = true;
        const data = res.data;

        // Chuyển đổi ngày tháng sang yyyy-MM-dd nếu cần (để binding vào input date)
        if (data.dateOfBirth) {
          data.dateOfBirth = new Date(data.dateOfBirth)
            .toISOString()
            .substring(0, 10);
        }
        // if (data.createdAt) {
        //   data.createdAt = new Date(data.createdAt)
        //     .toISOString()
        //     .substring(0, 10);
        // }
        // if (data.updatedAt) {
        //   data.updatedAt = new Date(data.updatedAt)
        //     .toISOString()
        //     .substring(0, 10);
        // }
        // if (data.lockTime) {
        //   data.lockTime = new Date(data.lockTime)
        //     .toISOString()
        //     .substring(0, 10);
        // }

        this.detailAccountForm.patchValue(data);
        console.log(this.detailAccountForm)
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  changeStatus(status: number) {}
}
