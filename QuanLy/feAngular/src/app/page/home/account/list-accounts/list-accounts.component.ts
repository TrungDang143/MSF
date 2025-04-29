import { NgFor, NgIf, NgClass } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Account } from '../../../../model/account/account.model';
import { AccountService } from '../../../../services/account.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

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
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-accounts',
  imports: [
    NgIf,
    NgFor,
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
    TableModule,
    IconFieldModule,
    InputIconModule,
    TreeModule,
    CheckboxModule,
    PasswordModule,
    DividerModule,
    Menu,
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
    private apiPermission: PermissionService,
    private router: Router
  ) {}

  userIdSeleted: number = 0;
  userNameSeleted: string = '###';
  menuAccountActions: MenuItem[] = [];

  updateMenuActions() {
    this.menuAccountActions = [
      {
        label: 'User: ' + this.userNameSeleted,
        items: [
          {
            label: 'Xem chi tiết',
            icon: 'pi pi-user-edit',
            command: () => this.viewDetail(this.userIdSeleted),
          },
          {
            label: 'Đổi mật khẩu',
            icon: 'pi pi-lock',
            command: () => {
              this.showDialogChangePassword();
            },
          },
          {
            label: 'Đăng nhập',
            icon: 'pi pi-sign-in',
            command: () => {this.LoginAsUser()},
          },
          {
            label: 'Đăng xuất user',
            icon: 'pi pi-sign-out',
            command: () => {this.LogoutUser()},
          },
        ],
      },
    ];
  }

  openMenuAction(event: Event, menu: Menu, userId: number, userName: string) {
    this.userIdSeleted = userId;
    this.userNameSeleted = userName;
    this.updateMenuActions();
    menu.toggle(event);
  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  globalFilterValue: string = '';
  listUser: Account[] = [];
  listRole: { roleID: string; roleName: string }[] = [];

  genders = [];
  roles = [];
  status = [];

  ngOnInit(): void {
    this.loadData();
    this.getPasswordRule();
  }

  isMe(username?: string): boolean {
    if (username) return this.authService.getUser() == username;
    return this.authService.getUser() == this.userNameSeleted;
  }

  loadData() {
    this.apiAccount.GetAllUserAccount().subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.listUser = res.data.users;
          this.apiAccount.GetAllRole().subscribe({
            next: (res) => {
              if (res.result == '1') this.listRole = res.data;
            },
            error: (err) => {
              this.pop.showOkPopup({ message: 'Lỗi lấy danh sách role' });
              console.log(err);
            },
          });
        } else {
          this.pop.showOkPopup({ message: 'Không tìm thấy tài khoản!' });
        }
      },
      error: (err) => {
        this.pop.showOkPopup({ message: 'Lỗi lấy danh sách users' });
        console.log(err);
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
    isExternalAvatar: new FormControl(false),
    permissionIds: new FormControl<number[]>([]),
  });

  viewDetail(id: any) {
    this.apiAccount.GetDetailUserInfo(id).subscribe({
      next: (res) => {
        this.showDialogDetail();

        const data = res.data;
        this.genders = data.listGender;
        this.roles = data.listRole;
        this.status = data.listStatus;

        this.detailAccountForm.patchValue(data);
        if (this.isMe(this.detailAccountForm.get('username')?.value)) {
          this.detailAccountForm.get('roleID')?.disable();
        } else {
          this.detailAccountForm.get('roleID')?.enable();
        }

        var dateOfBirth: Date | null;
        if (data.dateOfBirth) {
          dateOfBirth = this.parseDateFromString(data.dateOfBirth);
          this.detailAccountForm.patchValue({ dateOfBirth: dateOfBirth });
        }

        this.detailAccountForm.markAsPristine();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  //be gui ve string
  parseDateFromString(dateStr: string): Date {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  //gui lai string cho be
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
    console.log(this.detailAccountForm.value);
    const birht = this.detailAccountForm.get('dateOfBirth');
    if (birht && birht.value) {
      let convertDate = this.formatDateToString(birht.value);
      this.detailAccountForm.patchValue({ dateOfBirth: convertDate });
    }
    this.apiAccount.UpdateUser(this.detailAccountForm.getRawValue()).subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.loadData();
          this.apiAccount
            .UpdateUserPermission(
              this.detailAccountForm.get('userID')?.value,
              this.detailAccountForm.get('permissionIds')?.value
            )
            .subscribe({
              next: (res) => {
                if (res.result == '1') {
                  // this.pop.showOkPopup({ message: res.message });

                  this.pop.showOkPopup({ message: 'Cập nhật thành công!' });
                  this.disabledBtnSave = false;
                  this.closeDialogDetail();

                  this.displayPopupPermission = false;
                } else if (res.result == '1'){
                  this.pop.showOkPopup({ message: res.message });
                }
                else{
                  this.pop.showSysErr();
                  console.log(res.message);
                }
              },
              error: (err) => {
                this.pop.showOkPopup({
                  header: 'Lỗi',
                  message: 'Lỗi kết nối server, không thể update permission!',
                });
                console.log(err);
              },
            });
        } else {
          this.pop.showOkPopup({ message: 'Lỗi cập nhật thông tin!' });
          this.disabledBtnSave = false;
        }
      },
      error: (err) => {
        this.pop.showOkPopup({
          header: 'Lỗi',
          message: 'Không thể kết nối với server!',
        });
        this.disabledBtnSave = false;
        console.log(err.message);
      },
    });
    //fileUpload.clear();
  }

  closeDialogDetail() {
    this.displayDetail = false;
    this.detailAccountForm.reset();
  }
  showDialogDetail() {
    this.isChangedRole = false;
    this.displayDetail = true;
    this.closeDialogCreateUser();
    this.detailAccountForm.reset();
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
          this.closeDialogDetail();
          this.loadData();
        } else {
          this.pop.showOkPopup({ message: 'Lỗi khi xoá user!' });
        }
      },
      error: (err) => {
        this.pop.showOkPopup({
          header: 'Lỗi',
          message: 'Không thể kết nối với server!',
        });
        console.log(err.message);
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
    if (this.croppedImage) {
      if (this.displayPopupCreateUser) {
        this.createAccountForm.patchValue({ avatar: this.croppedImage });
        this.createAccountForm.markAsDirty();
      } else if (this.displayDetail) {
        this.detailAccountForm.patchValue({ avatar: this.croppedImage });
        this.detailAccountForm.markAsDirty();
      }
    }

    this.displayPopupAvatar = false;
  }

  displayPopupPermission = false;
  cateloryPermission: string[] = [
    'Quản lý người dùng',
    'Quản lý vai trò',
    'Quản lý phân quyền',
    'Quản lý nội dung',
    'Phân quyền Admin',
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
    if (permissionNameGroup == this.cateloryPermission[0]) {
      this.showDetailPermission = 1;
    } else if (permissionNameGroup == this.cateloryPermission[1]) {
      this.showDetailPermission = 2;
    } else if (permissionNameGroup == this.cateloryPermission[2]) {
      this.showDetailPermission = 3;
    } else if (permissionNameGroup == this.cateloryPermission[3]) {
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
      this.isAllUserSelected = false;
      this.isAllRoleSelected = false;
      this.isAllPermissionSelected = false;
      this.isAllContentSelected = false;
      this.isAllSystemSelected = false;
      this.toggleAllDetail(
        this.permission_User,
        this.permission_User_Selected,
        false
      );
      this.toggleAllDetail(
        this.permission_Role,
        this.permission_Role_Selected,
        false
      );
      this.toggleAllDetail(
        this.permission_Permission,
        this.permission_Permission_Selected,
        false
      );
      this.toggleAllDetail(
        this.permission_Content,
        this.permission_Content_Selected,
        false
      );
      this.toggleAllDetail(
        this.permission_System,
        this.permission_System_Selected,
        false
      );
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

  showPermission() {
    this.displayPopupPermission = true;

    this.permission_User.length = 0;
    this.permission_Role.length = 0;
    this.permission_Content.length = 0;
    this.permission_Permission.length = 0;
    this.permission_System.length = 0;

    this.permission_User_Selected.length = 0;
    this.permission_Role_Selected.length = 0;
    this.permission_Content_Selected.length = 0;
    this.permission_Permission_Selected.length = 0;
    this.permission_System_Selected.length = 0;

    this.showDetailPermission = 0;
    this.isAllUserSelected = false;
    this.isAllRoleSelected = false;
    this.isAllPermissionSelected = false;
    this.isAllContentSelected = false;
    this.isAllSystemSelected = false;
    this.isAllCatelorySelected = false;

    this.permissionSelected.length = 0;
  }

  mockupUserPermission(permissionIds: number[]) {
    const permissionGroups = [
      {
        nodes: this.permission_User,
        selected: this.permission_User_Selected,
      },
      {
        nodes: this.permission_Role,
        selected: this.permission_Role_Selected,
      },
      {
        nodes: this.permission_Permission,
        selected: this.permission_Permission_Selected,
      },
      {
        nodes: this.permission_Content,
        selected: this.permission_Content_Selected,
      },
      {
        nodes: this.permission_System,
        selected: this.permission_System_Selected,
      },
    ];

    this.toggleAllPermissionByIds(permissionGroups, permissionIds);

    this.updateParentSelection(
      this.permission_User,
      this.permission_User_Selected
    );
    this.updateParentSelection(
      this.permission_Role,
      this.permission_Role_Selected
    );
    this.updateParentSelection(
      this.permission_Permission,
      this.permission_Permission_Selected
    );
    this.updateParentSelection(
      this.permission_Content,
      this.permission_Content_Selected
    );
    this.updateParentSelection(
      this.permission_System,
      this.permission_System_Selected
    );

    for (let i = 1; i <= 5; i++) {
      this.onDetailSelectionChange(i);
    }
  }

  mockupPermission(data: any) {
    this.permission_User = [
      {
        label: 'User',
        data: 'permission_User',
        expanded: true,
        children: this.convertToTreeNodes(data.permission_User),
      },
    ];
    this.permission_Role = [
      {
        label: 'Role',
        data: 'permission_Role',
        expanded: true,
        children: this.convertToTreeNodes(data.permission_Role),
      },
    ];

    this.permission_Content = [
      {
        label: 'Content',
        data: 'permission_Content',
        expanded: true,
        children: this.convertToTreeNodes(data.permission_Content),
      },
    ];

    this.permission_Permission = [
      {
        label: 'Permission',
        data: 'permission_Permission',
        expanded: true,
        children: this.convertToTreeNodes(data.permission_Permission),
      },
    ];

    this.permission_System = [
      {
        label: 'Admin',
        data: 'permission_System',
        expanded: true,
        children: this.convertToTreeNodes(data.permission_System),
      },
    ];
  }

  isChangedRole = false;

  //detail user
  //show permission cua user
  userPermission() {
    this.apiPermission.getAllPermission().subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.showPermission();
          this.mockupPermission(res.data);

          if (!this.isChangedRole) {
            if (this.detailAccountForm.get('permissionIds')?.value) {
              let permissionIds: [] =
                this.detailAccountForm.get('permissionIds')?.value;
              this.mockupUserPermission(permissionIds);
            } else {
              //lay tat ca quyen (role + extend)
              this.apiAccount
                .GetAllUserPermission(this.userIdSeleted)
                .subscribe({
                  next: (res) => {
                    if (res.result == '1') {
                      let permissionIds: [] = res.data;

                      this.mockupUserPermission(permissionIds);
                    } else {
                      this.pop.showOkPopup({ message: res.message });
                    }
                  },
                  error: (err) => {
                    this.pop.showOkPopup({ message: 'Lỗi kết nối server!' });
                    console.log(err);
                  },
                });
            }
          } else {
            this.apiPermission
              .getPermissionByRoleID(this.userIdSeleted)
              .subscribe({
                next: (res) => {
                  if (res.result == '1') {
                    let permissionIds: [] = res.data;
                    this.mockupUserPermission(permissionIds);
                  } else {
                    this.pop.showOkPopup({ message: res.message });
                  }
                },
                error: (err) => {
                  this.pop.showOkPopup({ message: 'Lỗi kết nối server!' });
                  console.log(err);
                },
              });
          }

          this.getPermission(this.cateloryPermission[0]);
        } else {
          this.pop.showOkPopup({ message: res.message });
        }
      },
      error: (err) => {
        this.pop.showOkPopup({
          header: 'Lỗi',
          message: 'Không thể kết nối với server!',
        });
        this.displayPopupPermission = false;
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

  toggleAllPermissionByIds(
    permissionGroups: { nodes: TreeNode[]; selected: TreeNode[] }[],
    selectedIds: number[]
  ) {
    for (let group of permissionGroups) {
      this.markSelectedNodes(group.nodes, selectedIds, group.selected);
    }
  }

  private markSelectedNodes(
    nodes: TreeNode[],
    selectedIds: number[],
    selectedList: TreeNode[]
  ) {
    for (let node of nodes) {
      this.markNodeRecursive(node, selectedIds, selectedList);
    }
  }

  private markNodeRecursive(
    node: TreeNode,
    selectedIds: number[],
    selectedList: TreeNode[]
  ) {
    const id = node.data?.permissionID;
    if (id && selectedIds.includes(id)) {
      selectedList.push(node);
    }

    if (node.children) {
      for (let child of node.children) {
        this.markNodeRecursive(child, selectedIds, selectedList);
      }
    }
  }

  updateParentSelection(nodes: TreeNode[], selectedNodes: TreeNode[]) {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        // Gọi đệ quy cho node con trước
        this.updateParentSelection(node.children, selectedNodes);

        const allChildrenSelected = node.children.every((child) =>
          selectedNodes.includes(child)
        );

        if (allChildrenSelected && !selectedNodes.includes(node)) {
          selectedNodes.push(node);
        }

        const someChildrenSelected = node.children.some((child) =>
          selectedNodes.includes(child)
        );

        if (
          !allChildrenSelected &&
          someChildrenSelected &&
          !selectedNodes.includes(node)
        ) {
          // Nếu bạn muốn hiển thị trạng thái "một phần được chọn" thì xử lý ở đây (tuỳ chọn)
          // PrimeNG không hỗ trợ trạng thái "indeterminate" khi dùng [(selection)] nên có thể bỏ qua
        }
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
    const ids: number[] = [];

    this.permissionSelected.forEach((node) => {
      if (node.leaf && node.data?.permissionID) {
        ids.push(node.data.permissionID);
      }
    });
    if (this.detailAccountForm.get('roleID')?.value == 1) {
      this.pop.showOkPopup({
        message: 'Không thể chỉnh sửa quyền của role Admin!!',
      });
      return;
    }
    this.detailAccountForm.patchValue({ permissionIds: ids });
    this.displayPopupPermission = false;
    this.detailAccountForm.markAsDirty();
  }

  displayPopupCreateUser: boolean = false;
  disableBtnCreateUser: boolean = false;
  listRole_Create: [] = [];
  listGender_Create: [] = [];
  listStatus_Create: [] = [];

  createAccountForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      this.passwordRulesValidator(),
    ]),
    fullName: new FormControl(null, [Validators.maxLength(100)]),
    phoneNumber: new FormControl(null, [Validators.maxLength(15)]),
    avatar: new FormControl(null),
    dateOfBirth: new FormControl(null),
    gender: new FormControl(null),
    address: new FormControl(null, [Validators.maxLength(100)]),
    status: new FormControl(null, [Validators.required]),
    googleID: new FormControl(null),
    facebookID: new FormControl(null),
    roleID: new FormControl(null, [Validators.required]),
    permissionIds: new FormControl(''),
  });

  showDialogCreateUser() {
    this.isChangedRole = false;
    this.displayPopupCreateUser = true;
    this.closeDialogDetail();
    this.createAccountForm.reset();
  }
  closeDialogCreateUser() {
    this.displayPopupCreateUser = false;
    this.createAccountForm.reset();
  }
  createUserPopup() {
    this.closeDialogDetail();

    this.apiAccount.GetRoleGenderStatus().subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.createAccountForm.reset();
          this.listRole_Create = res.data.listRole.filter(
            (role: any) => role.roleID != 1
          );
          this.listGender_Create = res.data.listGender;
          this.listStatus_Create = res.data.listStatus;

          this.getPasswordRule();

          this.showDialogCreateUser();
        } else {
          this.pop.showOkPopup({ message: 'Lỗi khởi tạo form create!' });
        }
      },
      error: (err) => {
        this.pop.showOkPopup({ message: 'Lỗi kết nối server' });
        console.log(err);
      },
    });
  }

  changeRole() {
    if (this.displayDetail) {
      if (this.detailAccountForm.get('roleID')?.value == 1) {
        this.pop.showOkPopup({ message: 'Không thể set role Admin cho user!' });
        this.detailAccountForm.get('roleID')?.reset();
      }
    }
    this.createAccountForm.get('permissionIds')?.setValue([]);
    this.detailAccountForm.get('permissionIds')?.setValue([]);
    this.isChangedRole = true;
  }

  createUserPermission() {
    this.apiPermission.getAllPermission().subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.showPermission();
          this.mockupPermission(res.data);

          if (this.createAccountForm.get('roleID')?.value) {
            this.apiPermission
              .getPermissionByRoleID(
                this.createAccountForm.get('roleID')?.value
              )
              .subscribe({
                next: (res) => {
                  if (res.result == '1') {
                    let rolePermissionIds: [] = res.data;
                    let lastSetPermissionIds = this.createAccountForm.get(
                      'permissionIds'
                    )?.value as number[];
                    console.log(this.createAccountForm.get('permissionIds'));
                    let permissionIds: number[];
                    if (lastSetPermissionIds) {
                      permissionIds = [
                        ...new Set([
                          ...rolePermissionIds,
                          ...lastSetPermissionIds,
                        ]),
                      ];
                    } else {
                      permissionIds = [...rolePermissionIds];
                    }
                    this.mockupUserPermission(permissionIds);
                  } else {
                    this.pop.showOkPopup({ message: res.message });
                  }
                },
                error: (err) => {
                  this.pop.showOkPopup({ message: 'Lỗi kết nối server!' });
                  console.log(err);
                },
              });
          } else {
            this.displayPopupPermission = false;
            this.pop.showOkPopup({ message: 'Vui lòng chọn Role trước!' });
          }

          this.getPermission(this.cateloryPermission[0]);
        } else {
          this.pop.showOkPopup({ message: res.message });
        }
      },
      error: (err) => {
        this.pop.showOkPopup({
          header: 'Lỗi',
          message: 'Không thể kết nối với server!',
        });
        this.displayPopupPermission = false;
        console.log(err);
      },
    });
  }

  addUserPermission() {
    this.permissionSelected = [
      ...this.permission_User_Selected,
      ...this.permission_Role_Selected,
      ...this.permission_Permission_Selected,
      ...this.permission_Content_Selected,
      ...this.permission_System_Selected,
    ];
    const ids: number[] = [];

    this.permissionSelected.forEach((node) => {
      if (node.leaf && node.data?.permissionID) {
        ids.push(node.data.permissionID);
      }
    });
    this.createAccountForm.patchValue({ permissionIds: ids });
    this.displayPopupPermission = false;
  }

  createUser() {
    if (!this.createAccountForm.valid) {
      this.pop.showOkPopup({ message: 'Kiểm tra lại thông tin user!' });
      return;
    }
    if (this.disableBtnCreateUser) return;
    this.disableBtnCreateUser = true;

    const birht = this.createAccountForm.get('dateOfBirth');
    if (birht && birht.value) {
      let convertDate = this.formatDateToString(birht.value);
      this.createAccountForm.patchValue({ dateOfBirth: convertDate });
    }

    this.apiAccount.CreateUser(this.createAccountForm.value).subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.pop.showOkPopup({ message: res.message });

          this.closeDialogCreateUser();

          this.loadData();
        } else {
          this.pop.showOkPopup({ message: res.message });
        }
        this.disableBtnCreateUser = false;
      },
      error: (err) => {
        this.pop.showOkPopup({ message: 'Lỗi kết nối server' });
        console.log(err);
        this.disableBtnCreateUser = false;
      },
    });
  }

  passwordRules: { settingKey: string; description: string }[] = [];
  minPasswordLength = 6;

  requiredUpper: boolean = true;
  requiredLower: boolean = true;
  requiredDigit: boolean = true;
  requiredSpecial: boolean = true;

  get passwordErrors_createAccount() {
    const control = this.createAccountForm.get('password');
    if (!control) return {};

    // Chỉ hiển thị lỗi nếu người dùng đã chạm vào (touched) hoặc sửa (dirty)
    if (!(control.touched || control.dirty)) return {};

    return control.errors || {};
  }
  get passwordDirtied_createAccount() {
    const control = this.createAccountForm.get('password');
    return control?.dirty;
  }

  getPasswordRule() {
    this.apiAccount.GetPasswordRule().subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.requiredUpper = false;
          this.requiredLower = false;
          this.requiredDigit = false;
          this.requiredSpecial = false;

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

      const errors: ValidationErrors = {};

      if (typeof password !== 'string') {
        if (this.requiredUpper) {
          errors['Password.RequireUpper'] = true;
        }
        if (this.requiredLower) {
          errors['Password.RequireLower'] = true;
        }
        if (this.requiredDigit) {
          errors['Password.RequireDigit'] = true;
        }
        if (this.requiredSpecial) {
          errors['Password.RequireSpecial'] = true;
        }
        errors['Password.MinLength'] = true;
      } else {
        if (
          (this.requiredUpper && !/[A-Z]/.test(password)) ||
          password.length == 0
        ) {
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
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  displayChangePassword = false;
  changePasswordForm = new FormGroup(
    {
      oldPassword: new FormControl<string>('', [Validators.required]),
      newPassword: new FormControl<string>('', [
        Validators.required,
        this.passwordRulesValidator(),
      ]),
      confirmNewPassword: new FormControl<string>('', [Validators.required]),
    },
    { validators: this.matchPassword }
  );

  showDialogChangePassword() {
    this.getPasswordRule();
    if (!this.isMe()) this.changePasswordForm.get('oldPassword')?.disable();
    else {
      this.changePasswordForm.get('oldPassword')?.enable();
    }
    this.displayChangePassword = true;
    this.changePasswordForm.reset();
  }
  closeDialogChangePassword() {
    this.displayChangePassword = false;
  }

  matchPassword(form: AbstractControl) {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmNewPassword')?.value;

    // if (!password || !confirmPassword) {
    //   // Nếu chưa nhập đủ 2 ô, không validate
    //   return null;
    // }

    if (password === confirmPassword) {
      // Nếu đúng, cần clear lỗi ở confirmNewPassword (nếu có)
      form.get('confirmNewPassword')?.setErrors(null);

      return null;
    } else {
      // Nếu sai, gán lỗi vào confirmNewPassword
      form.get('confirmNewPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
  }

  get passwordErrors_changePassword() {
    const control = this.changePasswordForm.get('newPassword');
    if (!control) return {};

    // Chỉ hiển thị lỗi nếu người dùng đã chạm vào (touched) hoặc sửa (dirty)
    if (!(control.touched || control.dirty)) return {};
    return control.errors || {};
  }
  get passwordDirtied_changePassword() {
    const control = this.changePasswordForm.get('newPassword');
    return control?.touched || control?.dirty;
  }

  handleChangePassword() {
    this.pop.showYesNoPopup({
      message: 'Bạn chắc chắn muốn đổi mật khẩu của user này chứ?',
      onAccept: () => {
        this.changePassword();
      },
    });
  }
  changePassword() {
    let apiChangePassword: Observable<any> = this.isMe()
      ? this.apiAccount.ChangeMyPassword(
          this.userNameSeleted,
          this.changePasswordForm.get('oldPassword')?.value!,
          this.changePasswordForm.get('newPassword')?.value!
        )
      : this.apiAccount.ChangeUserPassword(
          this.userNameSeleted,
          this.changePasswordForm.get('newPassword')?.value!
        );

    apiChangePassword.subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.pop.showOkPopup({ message: res.message });
          this.closeDialogChangePassword();
        } else if (res.result == '0') {
          this.pop.showOkPopup({ message: res.message });
          this.closeDialogChangePassword();
        } else {
          this.pop.showSysErr();
          console.log(res.message);
        }
      },
      error: (err) => {
        this.pop.showSysErr();
        console.log(err);
      },
    });
  }

  LoginAsUser(){
    this.apiAccount.LoginAsUser(this.userNameSeleted).subscribe({
      next: (res)=>{
        if(res.result == '1'){
          if(this.authService.loginAsUser()){
            console.log( "toiday");

            this.authService.saveUserData(res.data, false)

            this.router.navigate(['/home']);
            window.location.reload();
          } else{
            console.log( "Chỉ có thể login as user tối đa 5 lần!");
            this.pop.showOkPopup({message: "Chỉ có thể login as user tối đa 5 lần!"})
          }

        }else{
          this.pop.showOkPopup({message: res.message})
        }
      },
      error: (err) => {
        this.pop.showSysErr();
        console.log(err);
      }
    })
  }

  LogoutUser(){
    this.apiAccount.LogoutUser(this.userNameSeleted).subscribe({
      next: (res)=>{
        if(res.result == '1'){
          this.pop.showOkPopup({message: res.message})
        }else{
          this.pop.showSysErr();
          console.log(res.message)
        }
      },
      error: (err) => {
        this.pop.showSysErr();
        console.log(err);
      }
    })
  }
  
}
