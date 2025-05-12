import { NgFor, NgIf, NgClass } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Account } from '../../../../model/account/account.model';
import { AccountService } from '../../../../services/account.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
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
import { ScrollerOptions, TreeNode } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { PermissionService } from '../../../../services/permission.service';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import {
  PickListModule,
  PickListMoveToSourceEvent,
  PickListMoveToTargetEvent,
} from 'primeng/picklist';
import { PanelModule } from 'primeng/panel';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteLazyLoadEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { PaginatorState } from 'primeng/paginator';
import { PaginatorModule } from 'primeng/paginator';

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
    InputNumberModule,
    TabsModule,
    PickListModule,
    PanelModule,
    AutoCompleteModule,
    PaginatorModule,
  ],
  templateUrl: './list-accounts.component.html',
  styleUrl: './list-accounts.component.css',
})
export class ListAccountsComponent implements OnInit {
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
            command: () => {
              this.LoginAsUser();
            },
          },
          {
            label: 'Đăng xuất user',
            icon: 'pi pi-sign-out',
            command: () => {
              this.LogoutUser();
            },
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

  ngOnInit(): void {
    this.filterAccountForm.reset();
    this.rowsPerPageOptions = [5, 10, 20];
    this.loadUserLazy();
    this.getPasswordRule();
  }
  isMe(username?: string): boolean {
    if (username) return this.authService.getUser() == username;
    return this.authService.getUser() == this.userNameSeleted;
  }

  ///Load data vao trang
  rowsPerPageOptions = [5, 10, 20];
  filterAccountForm: FormGroup = new FormGroup({
    username: new FormControl<string>(''),
    fullname: new FormControl<string>(''),
    roleID: new FormControl<number>(-1),
    permissionID: new FormControl<number>(-1),
    pageSize: new FormControl<number>(this.rowsPerPageOptions[0]),
    pageNumber: new FormControl<number>(1),
  });

  collapsedChange: boolean = true;
  toggleFilterPanel() {
    this.collapsedChange = !this.collapsedChange;
  }

  listUser: Account[] = [];
  listRole: { roleID: number; roleName: string }[] = [];
  listPermission: { permissionID: number; permissionName: string }[] = [];

  loading = false;
  totalRows = 0;
  first: number = 0;
  rows: number = 10;

  getRole_filter() {
    this.apiAccount.GetRole().subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.listRole = res.data;

          let userRoleIds: [] =
            this.detailAccountForm.get('userRoleIds')?.value;
          this.listRoles = this.listRole.filter((role) => {
            return !userRoleIds.some((ur) => ur == role.roleID);
          });
          this.selectedRoles = this.listRole.filter((role) => {
            return userRoleIds.some((ur) => ur == role.roleID);
          });
        }
      },
      error: (err) => {
        this.pop.showOkPopup({ message: 'Lỗi lấy danh sách role' });
        console.log(err);
      },
    });
  }
  getPermission_filter() {
    this.filterAccountForm.get('permissionID')?.reset();
    let roleID: number | null = this.filterAccountForm.get('roleID')?.value;
    if (roleID) {
      this.apiPermission.GetPermissionByRoleIds([roleID]).subscribe({
        next: (res) => {
          if (res.result == '1') {
            this.listPermission = res.data;
          }
        },
        error: (err) => {
          this.pop.showOkPopup({ message: 'Lỗi lấy danh sách permission' });
          console.log(err);
        },
      });
    } else {
      //this.pop.showOkPopup({message: "Vui lòng chọn role trước!"})
      this.filterAccountForm.get('permissionID')?.reset();
    }
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? this.rowsPerPageOptions[0];

    this.loadUserLazy();
  }
  loadUserLazy() {
    this.loading = true;

    if (this.first !== undefined && this.rows !== undefined) {
      const page = this.first / this.rows! + 1;
      const pageSize = this.rows!;
      this.filterAccountForm.patchValue({
        pageNumber: page,
        pageSize: pageSize,
      });
      this.apiAccount.GetAccounts(this.filterAccountForm?.value).subscribe({
        next: (res) => {
          if (res.result == '1') {
            this.listUser = res.data.users;
            this.totalRows = res.totalRows;
            this.getRole_filter();
          } else if (res.result == '0') {
            this.pop.showOkPopup({ message: res.message });
          } else {
            this.pop.showOkPopup({ message: 'Lỗi lấy danh sách users' });
            console.log(res.message);
          }
          this.loading = false;
        },
        error: (err) => {
          this.pop.showSysErr();
          console.log(err);
          this.loading = false;
        },
      });
    }
  }

  filter() {
    this.first = 0;
    this.rows = this.rowsPerPageOptions[0];
    this.loadUserLazy();
  }
  refresh() {
    this.filterAccountForm.reset();
    this.first = 0;
    this.rows = 10;
    this.loadUserLazy();
  }

  ///end load data vao trang

  ///show detail
  displayDetail: boolean = false;

  detailAccountForm: FormGroup = new FormGroup({
    userID: new FormControl({ value: 0, disabled: true }),
    username: new FormControl({ value: '', disabled: true }),
    email: new FormControl({ value: '', disabled: true }),
    fullName: new FormControl(null, [
      Validators.minLength(5),
      Validators.maxLength(100),
    ]),
    phoneNumber: new FormControl(null, [
      Validators.minLength(10),
      Validators.maxLength(15),
    ]),
    avatar: new FormControl(null),
    dateOfBirth: new FormControl(null),
    gender: new FormControl(null),
    address: new FormControl(null, [
      Validators.minLength(10),
      Validators.maxLength(100),
    ]),
    status: new FormControl(null, [Validators.required]),
    createdAt: new FormControl(null),
    updatedAt: new FormControl(null),
    isGoogle: new FormControl(null),
    isFacebook: new FormControl(null),
    otp: new FormControl(null),
    roles: new FormControl(null),
    lockTime: new FormControl(null),
    remainTime: new FormControl(null),
    isExternalAvatar: new FormControl(false),
    userRoleIds: new FormControl<number[]>([]),
  });

  genders = [];
  status = [];
  viewDetail(id: any) {
    this.apiAccount.GetDetailUserInfo(id).subscribe({
      next: (res) => {
        this.showDialogDetail();

        const data = res.data;
        this.genders = data.listGender;
        this.status = data.listStatus;

        this.detailAccountForm.patchValue(data);
        // if (this.isMe(this.detailAccountForm.get('username')?.value)) {
        //   this.detailAccountForm.get('roleID')?.disable();
        //   this.detailAccountForm.get('permissionIds')?.disable();
        // } else {
        //   this.detailAccountForm.get('roleID')?.enable();
        //   this.detailAccountForm.get('permissionIds')?.enable();
        // }

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
      this.detailAccountForm.markAllAsTouched();
      Object.keys(this.detailAccountForm.controls).forEach((key) => {
        const controlErrors = this.detailAccountForm.get(key)?.errors;
        if (controlErrors) {
          console.log(`Lỗi ở '${key}':`, controlErrors);
        }
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

    if (!this.isMe()) {
      this.apiAccount
        .UpdateUser(this.detailAccountForm.getRawValue())
        .subscribe({
          next: (res) => {
            if (res.result == '1') {
              this.pop.showOkPopup({ message: 'Cập nhật thành công!' });

              this.displayPopupPermission = false;

              this.closeDialogDetail();
              this.loadUserLazy();
            } else if (res.result == '2') {
              this.pop.showOkPopup({ message: res.message });
            } else {
              this.pop.showSysErr();
              console.log(res.message);
            }
            this.disabledBtnSave = false;
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
    }
  }

  linkGG() {
    if (
      this.detailAccountForm.get('isGoogle')?.value &&
      this.detailAccountForm.get('isGoogle')?.value == true
    ) {
      this.pop.showYesNoPopup({
        message: 'Bạn chắc chắn muốn bỏ liên kết Google?',
        onAccept: () => {
          //todo: unlink gg
        },
      });
    } else {
      this.pop.showYesNoPopup({
        message: 'Bạn chắc chắn muốn liên kết với Google?',
        onAccept: () => {},
      });
    }
  }
  linkFB() {
    if (
      this.detailAccountForm.get('isFacebook')?.value &&
      this.detailAccountForm.get('isFacebook')?.value == true
    ) {
      this.pop.showYesNoPopup({
        message: 'Bạn chắc chắn muốn bỏ liên kết Facebook?',
        onAccept: () => {
          //todo: unlink fb
        },
      });
    } else {
      this.pop.showYesNoPopup({
        message: 'Bạn chắc chắn muốn liên kết với Facebook?',
        onAccept: () => {},
      });
    }
  }
  closeDialogDetail() {
    this.displayDetail = false;
    this.detailAccountForm.reset();
  }
  showDialogDetail() {
    this.displayDetail = true;
    this.closeDialogCreateUser();
    this.detailAccountForm.reset();
  }
  ///end show detail

  ///delete
  deleteUser(userID: number) {
    if (this.isMe()){
      this.pop.showOkPopup({
        message: "Không thể xoá chính mình!"
      })
      return;
    }
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
          this.pop.showOkPopup({ message: res.message });
          this.closeDialogDetail();
          this.loadUserLazy();
        } else {
          this.pop.showOkPopup({ message: 'Lỗi khi xoá user!' });
          console.log(res.message);
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
  ///end delete

  ///change avatar
  displayPopupAvatar = false;

  imageChangedEvent: Event | null = null;
  croppedImage: string = '';
  fileSizeError: boolean = false;
  @ViewChild('avatarInput') avatarInput!: ElementRef;

  changeAvatar() {
    this.imageChangedEvent = null;
    this.croppedImage = '';
    this.displayPopupAvatar = true;
    this.fileSizeError = false;
    this.avatarInput.nativeElement.value = '';
  }

  fileChangeEvent(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const maxSize = 3 * 1024 * 1024;
      if (file.size > maxSize) {
        this.fileSizeError = true;
        input.value = '';
        this.imageChangedEvent = null;
      } else {
        this.fileSizeError = false;
        this.imageChangedEvent = event;
      }
    }
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
    this.pop.showOkPopup({ message: 'Không thể load ảnh!' });
  }
  submitToServer() {
    if (this.croppedImage) {
      if (this.displayPopupCreateUser) {
        this.createAccountForm.patchValue({ avatar: this.croppedImage });
        this.detailAccountForm.markAsTouched();
        this.createAccountForm.markAsDirty();
      } else if (this.displayDetail) {
        this.detailAccountForm.patchValue({ avatar: this.croppedImage });
        this.detailAccountForm.markAsTouched();
        this.detailAccountForm.markAsDirty();
      }
    }

    this.displayPopupAvatar = false;
  }
  ///end chảnge avatar

  ///show userrole
  displayPopupPermission = false;

  listRoles: { roleID: number; roleName: string }[] = [];
  selectedRoles: { roleID: number; roleName: string }[] = [];

  rolePermissionsByRoleID: { [roleID: number]: TreeNode[] } = {};
  selectedRolePermissionsByRoleID: { [roleID: number]: TreeNode[] } = {};

  userRoles: { roleID: number; roleName: string }[] = [];
  selectedRoleID: number = 0;

  isAllRolePermissionsSelected: boolean = false;
  isAllCatelorySelected: boolean = false;

  handleAddRoleForUser() {
    this.pop.showYesNoPopup({
      message: 'Bạn có chắc chắn muốn chỉnh sửa role của user?',
      onAccept: () => {
        this.addRoleForUser(true)
      },
    });
  }
  addRoleForUser(isNoChange?: boolean) {
    let roleIds: number[] = [];
    this.selectedRoles.forEach((role) => roleIds.push(role.roleID));

    let oldRoleIds: number[] = this.detailAccountForm.get('userRoleIds')?.value;
    let newRoleIds: number[] = roleIds.filter(
      (roleID) => !oldRoleIds.includes(roleID)
    );
    this.getPermissionByRoleIds(roleIds, newRoleIds);
    this.onCatelorySelectionChange();

    if (this.isMe()){
      this.pop.showOkPopup({
        message: "Không thể chỉnh sửa vai trò của chính mình!"
      })
      return;
    }
    if(isNoChange)
      this.updateUserPermission();
  }

  refreshUserRole() {
    this.getRole_filter();
    this.getPermissionByRoleIds(
      this.detailAccountForm.get('userRoleIds')?.value
    );
  }

  getPermissionByRoleIds(roleIds: number[], newRoleIds?: number[]) {
    this.apiPermission.GetPermissionByRoleIds(roleIds).subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.rolePermissionsByRoleID = {};
          this.selectedRolePermissionsByRoleID = {};

          const grouped = new Map<
            number,
            { roleName: string; permissions: TreeNode[] }
          >();

          res.data.forEach((item: any) => {
            if (!grouped.has(item.roleID)) {
              grouped.set(item.roleID, {
                roleName: item.roleName,
                permissions: [],
              });
            }

            grouped.get(item.roleID)?.permissions.push({
              label:
                item.description || item.permissionName || 'Unnamed Permission',
              data: {
                permissionID: item.permissionID,
                description: item.description,
              },
              leaf: true,
            });
          });

          grouped.forEach((value, roleID) => {
            this.rolePermissionsByRoleID[roleID] = [
              {
                label: value.roleName,
                data: { roleID },
                expanded: true,
                children: value.permissions,
              },
            ];
            this.selectedRolePermissionsByRoleID[roleID] = [];

            this.userRoles.push({ roleID, roleName: value.roleName });
            this.selectedRoleID = Number(
              Object.keys(this.rolePermissionsByRoleID)[0]
            );
          });
        }
        if(newRoleIds){
          newRoleIds.forEach((roleID: number) => {
            this.toggleAllPermissionNodes(
              this.rolePermissionsByRoleID[roleID],
              this.selectedRolePermissionsByRoleID[roleID],
              true
            );
          });
        }

        this.getUserPermission(
          this.detailAccountForm.get('userID')?.value,
          this.detailAccountForm.get('userRoleIds')?.value
        );
      },
      error: (err: any) => {
        this.pop.showSysErr();
        console.log(err);
      },
    });
  }

  toggleAllCatelory() {
    let roleIds = this.selectedRoles.map((role) => role.roleID);
    if (this.isAllCatelorySelected) {
      roleIds.forEach((roleID) => {
        this.toggleAllPermissionNodes(
          this.rolePermissionsByRoleID[roleID],
          this.selectedRolePermissionsByRoleID[roleID],
          true
        );
      });
    } else {
      roleIds.forEach((roleID) => {
        this.toggleAllPermissionNodes(
          this.rolePermissionsByRoleID[roleID],
          this.selectedRolePermissionsByRoleID[roleID],
          false
        );
      });
    }
    this.onCatelorySelectionChange();
  }
  private toggleAllPermissionNodes(
    nodes: TreeNode[],
    selectedNodes: TreeNode[],
    isSelected: boolean
  ): void {
    nodes.forEach((node) => {
      if (isSelected) {
        if (!selectedNodes.includes(node)) {
          selectedNodes.push(node);
        }
      } else {
        const index = selectedNodes.indexOf(node);
        if (index > -1) {
          selectedNodes.splice(index, 1);
        }
      }

      if (node.children && node.children.length > 0) {
        this.toggleAllPermissionNodes(node.children, selectedNodes, isSelected);
      }
    });
    this.onCatelorySelectionChange();
  }

  onCatelorySelectionChange() {
    this.isAllCatelorySelected = this.isSelectionMatch();
  }

  isSelectionMatch(): boolean {
    const allRoleIDs = Object.keys(this.rolePermissionsByRoleID);

    for (const roleID of allRoleIDs) {
      const allNodes = this.rolePermissionsByRoleID[+roleID] || [];
      const selectedNodes = this.selectedRolePermissionsByRoleID[+roleID] || [];

      const totalAll = this.countTreeNodes(allNodes);
      const totalSelected = this.countTreeNodes(selectedNodes);

      if (totalAll !== totalSelected) {
        return false;
      }
    }

    return true;
  }

  private countTreeNodes(nodes: TreeNode[]): number {
    let count = 0;

    nodes.forEach((node) => {
      count++;
      if (node.children && node.children.length > 0) {
        count += this.countTreeNodes(node.children);
      }
    });

    return count;
  }

  showPermission() {
    this.displayPopupPermission = true;
    this.refreshUserRole();
    this.onCatelorySelectionChange();
  }
  closePermision(){
    this.displayPopupPermission = false;
    this.viewDetail(this.userIdSeleted)
  }

  getUserPermission(userID: number, roleIds: number[]) {
    this.apiPermission
      .GetPermissionForUserByRoleIds(userID, roleIds)
      .subscribe({
        next: (res) => {
          if (res.result == '1') {
            this.fillSelectedRolePermissions(res.data);
            //this.mockupUserPermission(roleIds)
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
  fillSelectedRolePermissions(
    payload: { roleID: number; permissionIds: number[] }[]
  ) {
    payload.forEach((rolePermission) => {
      const { roleID, permissionIds } = rolePermission;

      const nodes = this.rolePermissionsByRoleID[roleID];
      if (!nodes) return;

      const matchedNodes: TreeNode[] = [];

      this.findMatchingPermissionNodes(nodes, permissionIds, matchedNodes);

      this.selectedRolePermissionsByRoleID[roleID] = matchedNodes;
    });
  }

  private findMatchingPermissionNodes(
    nodes: TreeNode[],
    permissionIds: number[],
    matchedNodes: TreeNode[]
  ): void {
    nodes.forEach((node) => {
      if (permissionIds.includes(node.data?.permissionID)) {
        matchedNodes.push(node);
      }

      if (node.children && node.children.length > 0) {
        this.findMatchingPermissionNodes(
          node.children,
          permissionIds,
          matchedNodes
        );

        const allChildrenSelected = node.children.every((child) =>
          matchedNodes.includes(child)
        );

        if (allChildrenSelected && !matchedNodes.includes(node)) {
          matchedNodes.push(node);
        }
      }
    });
  }

  //detail user
  //show permission cua user
  userPermission() {
    this.showPermission();
  }

  handleUpdateUserPermission(){
    if (this.isMe()){
      this.pop.showOkPopup({
        message: "Không thể chỉnh sửa vai trò của chính mình!"
      })
      return;
    }

    this.pop.showYesNoPopup({
      message: "Chắc chắn muốn cập nhật vai trò của user này?",
      onAccept: () =>{
        this.updateUserPermission();
      }
    })
  }
  updateUserPermission() {
    let payload: {roleID: number, unSelectPermissionIds: number[]}[] = []

    Object.keys(this.selectedRolePermissionsByRoleID).forEach((roleID) => {
      let _roleID = Number(roleID)
      const selectedRoleNode: number[] = this.selectedRolePermissionsByRoleID[_roleID]
      .map((role_permission) => role_permission.data.permissionID);

      const roleNode = this.rolePermissionsByRoleID[_roleID]?.[0]?.children!
      .map((role_permission) => role_permission.data.permissionID);

      let unSelectedRoleNode: number[] = []
      roleNode.forEach(perrmissionID => {
        if(!selectedRoleNode.includes(perrmissionID)){
          unSelectedRoleNode.push(perrmissionID)
        }
      })

      payload.push({roleID: _roleID, unSelectPermissionIds: unSelectedRoleNode})
    });
    this.apiAccount.UpdateUserRoles(this.userIdSeleted, payload).subscribe({
      next: res =>{
        if(res.result == '1'){
          this.pop.showOkPopup({message: res.message})
          this.closePermision();
        }else{
          this.pop.showSysErr();
          console.log(res.message)
        }
      },
      error: err=>{
        this.pop.showSysErr();
          console.log(err)
      }
    })
  }
  ///end show userrole

  ///show create user
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
    // if (this.displayDetail) {
    //   if (this.detailAccountForm.get('roleID')?.value == 1) {
    //     this.pop.showOkPopup({ message: 'Không thể set role Admin cho user!' });
    //     this.detailAccountForm.get('roleID')?.reset();
    //   }
    // }
    // this.createAccountForm.get('permissionIds')?.setValue([]);
    // this.detailAccountForm.get('permissionIds')?.setValue([]);
    // this.isChangedRole = true;
  }

  createUserPermission() {
    // this.apiPermission.getAllPermission().subscribe({
    //   next: (res) => {
    //     if (res.result == '1') {
    //       this.showPermission();
    //       this.mockupPermission(res.data);
    //       if (this.createAccountForm.get('roleID')?.value) {
    //         this.apiPermission
    //           .getPermissionByRoleID(
    //             this.createAccountForm.get('roleID')?.value
    //           )
    //           .subscribe({
    //             next: (res) => {
    //               if (res.result == '1') {
    //                 let rolePermissionIds: [] = res.data;
    //                 let lastSetPermissionIds = this.createAccountForm.get(
    //                   'permissionIds'
    //                 )?.value as number[];
    //                 console.log(this.createAccountForm.get('permissionIds'));
    //                 let permissionIds: number[];
    //                 if (lastSetPermissionIds) {
    //                   permissionIds = [
    //                     ...new Set([
    //                       ...rolePermissionIds,
    //                       ...lastSetPermissionIds,
    //                     ]),
    //                   ];
    //                 } else {
    //                   permissionIds = [...rolePermissionIds];
    //                 }
    //                 this.mockupUserPermission(permissionIds);
    //               } else {
    //                 this.pop.showOkPopup({ message: res.message });
    //               }
    //             },
    //             error: (err) => {
    //               this.pop.showOkPopup({ message: 'Lỗi kết nối server!' });
    //               console.log(err);
    //             },
    //           });
    //       } else {
    //         this.displayPopupPermission = false;
    //         this.pop.showOkPopup({ message: 'Vui lòng chọn Role trước!' });
    //       }
    //       this.getPermission(this.cateloryPermission[0]);
    //     } else {
    //       this.pop.showOkPopup({ message: res.message });
    //     }
    //   },
    //   error: (err) => {
    //     this.pop.showOkPopup({
    //       header: 'Lỗi',
    //       message: 'Không thể kết nối với server!',
    //     });
    //     this.displayPopupPermission = false;
    //     console.log(err);
    //   },
    // });
  }

  addUserPermission() {
    // this.permissionSelected = [
    //   ...this.permission_User_Selected,
    //   ...this.permission_Role_Selected,
    //   ...this.permission_Permission_Selected,
    //   ...this.permission_Content_Selected,
    //   ...this.permission_System_Selected,
    // ];
    // const ids: number[] = [];
    // this.permissionSelected.forEach((node) => {
    //   if (node.leaf && node.data?.permissionID) {
    //     ids.push(node.data.permissionID);
    //   }
    // });
    // this.createAccountForm.patchValue({ permissionIds: ids });
    // this.displayPopupPermission = false;
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

          this.loadUserLazy();
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
  ///end show create user

  ///show change password
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
  ///end show change password

  ///menu account
  LoginAsUser() {
    this.apiAccount.LoginAsUser(this.userNameSeleted).subscribe({
      next: (res) => {
        if (res.result == '1') {
          if (this.authService.loginAsUser()) {
            console.log('toiday');

            this.authService.saveUserData(res.data, false);

            this.router.navigate(['/home']).then(() => {
              window.location.reload();
            });
          } else {
            console.log('Chỉ có thể login as user tối đa 5 lần!');
            this.pop.showOkPopup({
              message: 'Chỉ có thể login as user tối đa 5 lần!',
            });
          }
        } else {
          this.pop.showOkPopup({ message: res.message });
        }
      },
      error: (err) => {
        this.pop.showSysErr();
        console.log(err);
      },
    });
  }

  LogoutUser() {
    this.apiAccount.LogoutUser(this.userNameSeleted).subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.pop.showOkPopup({ message: res.message });
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
  ///end menu account
}
