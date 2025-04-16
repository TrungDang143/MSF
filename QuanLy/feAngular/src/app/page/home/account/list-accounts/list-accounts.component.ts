import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { Table, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { PermissionService } from '../../../../services/permission.service';

@Component({
  selector: 'app-list-accounts',
  imports: [
    NgIf,
    NgFor,
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
    TableModule,
    IconFieldModule,
    InputIconModule,
    TreeModule,
    CheckboxModule,
  ],
  templateUrl: './list-accounts.component.html',
  styleUrl: './list-accounts.component.css',
})
export class ListAccountsComponent implements OnInit {
  @ViewChild('dt2') dt2: Table | undefined;
  constructor(
    private apiAccount: AccountService,
    private pop: PopupService,
    private authService: AuthService,
    private apiPermission: PermissionService
  ) {}

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  globalFilterValue: string = '';
  listUser: Account[] = [];

  genders = [];
  roles = ['Admin', 'Sub-Admin', 'User', 'Guest'];
  status = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.apiAccount.GetAllUserAccount().subscribe({
      next: (res) => {
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

  applyFilterGlobal($event: any, stringVal: any) {
    this.dt2!.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
  }

  selectedRole: any;
  filters: any = {
    roleName: { value: null, matchMode: 'equals' },
  };

  filterByRole(role: string) {
    this.filters.roleName.value = role;
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
    this.detailAccountForm.patchValue({ avatar: this.croppedImage });
    this.displayPopupAvatar = false;
  }

  displayPopupPermission = false;
  cateloryPermission: string[] = [
    'Quản lý người dùng',
    'Quản lý vai trò',
    'Quản lý phân quyền',
    'Quản lý nội dung',
    'Quản lý hệ thống',
  ];

  permission_User: TreeNode[] = [];
  permission_Role: TreeNode[] = [];
  permission_Content: TreeNode[] = [];
  permission_Permission: TreeNode[] = [];
  permission_System: TreeNode[] = [];

  permission_User_Selected: TreeNode[] = [];
  permission_Role_Selected: TreeNode[] = [];
  permission_Content_Selected: TreeNode[] = [];
  permission_Permission_Selected: TreeNode[] = [];
  permission_System_Selected: TreeNode[] = [];

  showDetailPermission: number = 0;
  isAllUserSelected: boolean = false;
  isAllRoleSelected: boolean = false;
  isAllPermissionSelected: boolean = false;
  isAllContentSelected: boolean = false;
  isAllSystemSelected: boolean = false;
  isAllCatelorySelected: boolean = false;

  permissionSelected: TreeNode[] = [];

  getPermission(permissionNameGroup: string) {

    if (permissionNameGroup == 'Quản lý người dùng') {
      this.showDetailPermission = 1;
    } else if (permissionNameGroup == 'Quản lý vai trò') {
      this.showDetailPermission = 2;
    } else if (permissionNameGroup == 'Quản lý phân quyền') {
      this.showDetailPermission = 3;
    } else if (permissionNameGroup == 'Quản lý nội dung') {
      this.showDetailPermission = 4;
    } else this.showDetailPermission = 5;
  }
  toggleAllCatelory() {
    if (this.isAllCatelorySelected) {
      this.isAllUserSelected = true;
      this.isAllRoleSelected = true;
      this.isAllPermissionSelected = true;
      this.isAllContentSelected = true;
      this.isAllSystemSelected = true;
      this.isAllCatelorySelected = true;

      this.toggleAllDetail(
        this.permission_User,
        this.permission_User_Selected,
        true
      );
      this.toggleAllDetail(
        this.permission_Role,
        this.permission_Role_Selected,
        true
      );
      this.toggleAllDetail(
        this.permission_Permission,
        this.permission_Permission_Selected,
        true
      );
      this.toggleAllDetail(
        this.permission_Content,
        this.permission_Content_Selected,
        true
      );
      this.toggleAllDetail(
        this.permission_System,
        this.permission_System_Selected,
        true
      );

      this.permissionSelected = [
        ...this.permission_User_Selected,
        ...this.permission_Role_Selected,
        ...this.permission_Permission_Selected,
        ...this.permission_Content_Selected,
        ...this.permission_System_Selected,
      ];
    } else {
      this.permissionSelected.length = 0;
    }
  }
  toggleAllDetail(
    nodes: TreeNode[],
    nodesSelected: TreeNode[],
    isChecked: boolean
  ) {
    nodesSelected.length = 0;

    if (isChecked) {
      nodes.forEach((node) => this.checkRecursive(node, nodesSelected));
    }
    this.onCatelorySelectionChange();
  }

  checkRecursive(node: TreeNode, selectedList: TreeNode[]) {
    selectedList.push(node);
    if (node.children) {
      node.children.forEach((child) =>
        this.checkRecursive(child, selectedList)
      );
    }
  }

  

  // getAllCateloryNodes(nodes: TreeNode[]): TreeNode[] {
  //   let result: TreeNode[] = [];
  //   for (let node of nodes) {
  //     result.push(node);
  //     if (node.children) {
  //       result = result.concat(this.getAllCateloryNodes(node.children));
  //     }
  //   }
  //   return result;
  // }
  getAllDetailNodes(nodes: TreeNode[]): TreeNode[] {
    let result: TreeNode[] = [];
    for (let node of nodes) {
      result.push(node);
      if (node.children) {
        result = result.concat(this.getAllDetailNodes(node.children));
      }
    }
    return result;
  }

  onCatelorySelectionChange() {
    this.isAllCatelorySelected =
      this.isAllContentSelected &&
      this.isAllPermissionSelected &&
      this.isAllRoleSelected &&
      this.isAllSystemSelected &&
      this.isAllUserSelected;
  }

  onDetailSelectionChange(showDetailPermission: number) {
    switch (showDetailPermission) {
      case 1: {
        const allNodeCount = this.getAllDetailNodes(
          this.permission_User
        ).length;
        const selectedCount = this.permission_User_Selected.length;
        this.isAllUserSelected = selectedCount === allNodeCount;
        break;
      }
      case 2: {
        const allNodeCount = this.getAllDetailNodes(
          this.permission_Role
        ).length;
        const selectedCount = this.permission_Role_Selected.length;
        this.isAllRoleSelected = selectedCount === allNodeCount;
        break;
      }
      case 3: {
        const allNodeCount = this.getAllDetailNodes(
          this.permission_Permission
        ).length;
        const selectedCount = this.permission_Permission_Selected.length;
        this.isAllPermissionSelected = selectedCount === allNodeCount;
        break;
      }
      case 4: {
        const allNodeCount = this.getAllDetailNodes(
          this.permission_Content
        ).length;
        const selectedCount = this.permission_Content_Selected.length;
        this.isAllContentSelected = selectedCount === allNodeCount;
        break;
      }
      case 5: {
        const allNodeCount = this.getAllDetailNodes(
          this.permission_System
        ).length;
        const selectedCount = this.permission_System_Selected.length;
        this.isAllSystemSelected = selectedCount === allNodeCount;
        break;
      }
      default: {
        break;
      }
    }
    this.onCatelorySelectionChange();
  }

  userPermission(userID: number) {
    this.displayPopupPermission = true;

    this.apiPermission.getAllPermission().subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.permission_User = [
            {
              label: 'User',
              data: 'permission_User',
              expanded: true,
              children: this.convertToTreeNodes(res.data.permission_User),
            },
          ];

          this.permission_Role = [
            {
              label: 'Role',
              data: 'permission_Role',
              expanded: true,
              children: this.convertToTreeNodes(res.data.permission_Role),
            },
          ];

          this.permission_Content = [
            {
              label: 'Content',
              data: 'permission_Content',
              expanded: true,
              children: this.convertToTreeNodes(res.data.permission_Content),
            },
          ];

          this.permission_Permission = [
            {
              label: 'Permission',
              data: 'permission_Permission',
              expanded: true,
              children: this.convertToTreeNodes(res.data.permission_Permission),
            },
          ];

          this.permission_System = [
            {
              label: 'System',
              data: 'permission_System',
              expanded: true,
              children: this.convertToTreeNodes(res.data.permission_System),
            },
          ];

          this.getPermission('Quản lý người dùng');
        } else {
          this.pop.showOkPopup({ message: res.message });
        }
      },
      error: (err) => {
        this.pop.showOkPopup({
          header: 'Lỗi',
          message: 'Không thể kết nối với server!',
        });
        console.log(err);
      },
    });
  }

  convertToTreeNodes(data: any[]): TreeNode[] {
    return data.map((perm) => ({
      label: perm.description,
      data: perm,
      key: perm.permissionID.toString(),
      leaf: true,
    }));
  }
  
  toggleNodesByIds(permissionList: TreeNode[], selectedIds: number[]) {
    // Reset mảng selected
    this.permission_System_Selected.length = 0;
  
    // Duyệt qua permission list và tìm node có id khớp với selectedIds
    permissionList.forEach((node) => {
      if (selectedIds.includes(node.data.permissionID)) {
        // Nếu có id khớp, chọn node đó
        this.permission_System_Selected.push(node);
      }
  
      // Duyệt đệ quy nếu node có children
      if (node.children && node.children.length > 0) {
        this.toggleNodesByIds(node.children, selectedIds);
      }
    });
  }

  updateUserPermission() {
    this.permissionSelected = [
      ...this.permission_User_Selected,
      ...this.permission_Role_Selected,
      ...this.permission_Permission_Selected,
      ...this.permission_Content_Selected,
      ...this.permission_System_Selected,
    ];
  }
}
