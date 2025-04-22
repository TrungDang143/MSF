import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Account } from '../../../../model/account/account.model';
import { AccountService } from '../../../../services/account.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import {
  FormControl,
  FormGroup,
  FormsModule,
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
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';

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
    PasswordModule,
    DividerModule,
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
  listRole: { roleID: string; roleName: string }[] = [];

  genders = [];
  roles = [];
  status = [];

  ngOnInit(): void {
    this.loadData();
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
        if (err.status === 403) {
          // Không có quyền
          this.pop.showOkPopup({
            message: 'Bạn không có quyền truy cập chức năng này.',
          });
          // Option: redirect
          // this.router.navigate(['/unauthorized']);
        } else {
          this.pop.showOkPopup({ message: 'Lỗi lấy danh sách users' });
          console.log(err);
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
        this.detailAccountForm.reset();
        this.displayDetail = true;
        this.displayPopupCreateUser = false;
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
    this.displayPopupCreateUser = false;
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
    if (this.croppedImage) {
      if (this.displayPopupCreateUser)
        this.createAccountForm.patchValue({ avatar: this.croppedImage });
      else this.detailAccountForm.patchValue({ avatar: this.croppedImage });
    }

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

  mockupUserPermission(permissionIds: number[]){
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

  mockupPermission(data: any){
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
        label: 'System',
        data: 'permission_System',
        expanded: true,
        children: this.convertToTreeNodes(data.permission_System),
      },
    ];
  }


  isChangedRole = false;

  //show permission cua user
  userPermission(userID: number) {
    this.apiPermission.getAllPermission().subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.showPermission();
          this.mockupPermission(res.data)

          console.log(this.isChangedRole);
          if(!this.isChangedRole){
            //lay tat ca quyen (role + extend)
            this.apiAccount.GetAllUserPermission(userID).subscribe({
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
          }else{
            this.apiPermission
              .getPermissionByRoleID(
                this.detailAccountForm.get('roleID')?.value
              )
              .subscribe({
                next: (res) => {
                  if (res.result == '1') {
                    let permissionIds: [] = res.data;
                    this.mockupUserPermission(permissionIds)
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
    } else {
      this.apiAccount
        .UpdateUserPermission(this.detailAccountForm.get('userID')?.value, ids)
        .subscribe({
          next: (res) => {
            if (res.result == '1') {
              this.pop.showOkPopup({ message: res.message });
              this.displayPopupPermission = false;
              this.loadData();
            } else {
              this.pop.showOkPopup({ message: res.message });
            }
          },
          error: (err) => {
            this.pop.showOkPopup({
              header: 'Lỗi',
              message: 'Lỗi kết nối server!',
            });
            console.log(err);
          },
        });
    }
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
      Validators.minLength(6),
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

  createUserPopup() {
    this.apiAccount.GetRoleGenderStatus().subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.createAccountForm.reset();
          this.listRole_Create = res.data.listRole;
          this.listGender_Create = res.data.listGender;
          this.listStatus_Create = res.data.listStatus;
          this.displayPopupCreateUser = true;
          this.displayDetail = false;
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
    this.createAccountForm.get('permissionIds')?.setValue([]);
    this.isChangedRole = true;
  }

  createUserPermission() {
    this.apiPermission.getAllPermission().subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.showPermission();
          this.mockupPermission(res.data)

          if (this.createAccountForm.get('roleID')?.value) {
            this.apiPermission
              .getPermissionByRoleID(
                this.createAccountForm.get('roleID')?.value
              )
              .subscribe({
                next: (res) => {
                  if (res.result == '1') {
                    let userPermissionIds: [] = res.data;
                    let lastSetPermissionIds = this.createAccountForm.get(
                      'permissionIds'
                    )?.value as number[];

                    let permissionIds: number[];
                    if (lastSetPermissionIds) {
                      permissionIds = [
                        ...new Set([
                          ...userPermissionIds,
                          ...lastSetPermissionIds,
                        ]),
                      ];
                    } else {
                      permissionIds = [...userPermissionIds];
                    }
                    this.mockupUserPermission(permissionIds)
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

    console.log(this.createAccountForm.value);
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
          this.displayPopupCreateUser = false;
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
}
