import { NgFor } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { SettingSystemService } from '../../../services/setting-system.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { PopupService } from '../../../shared/popup/popup.service';
import { Table, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { PermissionService } from '../../../services/permission.service';

@Component({
  selector: 'app-setting',
  imports: [
    TabsModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    TableModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MultiSelectModule,
    SelectModule,
    ButtonModule,
    CommonModule,
    DatePickerModule,
    FormsModule,
    PaginatorModule,CheckboxModule,InputNumberModule,DialogModule,FloatLabelModule, TreeModule
  ],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.css',
})
export class SettingComponent implements OnInit {
  constructor(private apiSetting: SettingSystemService, private apiPermission: PermissionService, private pop: PopupService){}

  SettingPasswordForm: FormGroup = new FormGroup({
    minLength: new FormControl(6, [Validators.required]),
    selectedRule: new FormControl([]),
  });
  
  rulePassword: any[] = []

  ngOnInit() {
    this.loadSettingPasswordData();
    this.loadListRole();
  }

  loadSettingPasswordData(){
    this.apiSetting.GetPasswordRule().subscribe({
      next: res =>{
        if(res.result == '1'){
          this.rulePassword = res.data.rulePassword
          this.SettingPasswordForm.patchValue({minLength: res.data.minPasswordLength})

          let selectedRule: any[] = [];
          this.rulePassword.forEach(rule=>{
            if(rule.isActive == true){
              selectedRule.push(rule);
            }
          })
          this.SettingPasswordForm.get("selectedRule")?.setValue(selectedRule);
        }else{
          this.pop.showOkPopup({message: "Lỗi lấy password rules!"})
          console.log(res.message);
        }
      }
    })
  }
  saveSettingPassword(){
    for(let rule of this.rulePassword){
      if(this.SettingPasswordForm.get("selectedRule")?.value.some((s:any) => s.settingKey === rule.settingKey)){
        rule.isActive = true;
        continue;
      }
      rule.isActive = false;
    }

    console.log(this.rulePassword)
    if(!this.SettingPasswordForm.valid){
      this.pop.showOkPopup({message: "Vui lòng điền đầy đủ thông tin!"});
      return;
    }else{
      this.apiSetting.UpdatePasswordRule(this.SettingPasswordForm.get("minLength")?.value, this.rulePassword).subscribe({
        next: res =>{
          if(res.result == '1'){
            this.pop.showOkPopup({message: res.message})
          }else{
            this.pop.showOkPopup({message: "Lỗi update password rules!"})
            console.log(res.message);
          }
        },
        error: err =>{
          this.pop.showOkPopup({header: "Lỗi", message: "Lỗi cập nhật password rule!"});
          console.log(err);
        }
      })
    }
  }

  @ViewChild('dt2') dt2: Table | undefined;

  selectedRoles: any[] = [];
  roles: any[] = [];

  applyFilterGlobal($event: any, stringVal: any) {
    this.dt2!.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
    this.selectedRoles.length = 0
  }
 
  loadListRole(){
    this.apiSetting.GetListRole().subscribe({
      next: res =>{
        if(res.result == '1'){
          this.roles = res.data;
          console.log(this.roles)
        }else{
          this.pop.showOkPopup({
            message: "Lỗi lấy danh sách role!"
          })
        }
      },
      error: err =>{
        this.pop.showOkPopup({header: "Lỗi",message:"Lỗi kết nối server!"});
      } 
    })
  }

  refresh() {
    this.selectedRoles.length = 0;
    this.loadListRole();
    }

  selectedRoleIds: number[] = []

  handleDeleteRoles() {
    if(this.selectedRoles.length == 0){
      this.pop.showOkPopup({message: "Vui lòng chọn 1 vai trò để xoá!"});
    }else{
      if (this.selectedRoleIds.indexOf(1) < 0){
        this.pop.showOkPopup({message: "Không thể xoá role Admin!"});
        return;
      }

      this.pop.showYesNoPopup({
        header: 'Xác nhận',
        message: 'Bạn có chắc chắn muốn xoá vai trò?',
        onAccept: () => {
          this.deleteRole();
        },
        onReject: () => {
          console.log('huy');
        },
      });
    } 
  }

  deleteRole(){
    this.selectedRoles.forEach(element => {
      this.selectedRoleIds.push(element.roleID)
    });

    this.apiSetting.DeleteRoles(this.selectedRoleIds).subscribe({
      next: res=>{
        if(res.result == '1'){
          this.pop.showOkPopup({message: res.message});
          this.selectedRoles.length = 0;
          this.selectedRoleIds.length = 0;
          this.loadListRole();
        }else{
          this.pop.showOkPopup({message: "Lỗi xoá role!"});
          console.log(res.message);
        }
      },
      error: err=>{
        this.pop.showOkPopup({message: "Không thể kết nối server!"})
        console.log(err);
      },
      
    })
  }

  displayDialogNewRole = false;

  createRoleForm: FormGroup = new FormGroup({
    roleName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    description: new FormControl('', [Validators.maxLength(100)]),
    permissionIds: new FormControl([])
  })

  showCreateRoleForm(){
    this.displayDialogNewRole = true;
    this.createRoleForm.reset();
  }
  closeCreateRoleForm(){
    this.displayDialogNewRole = false;
  }

  disableBtnNewRole = false;

  handleCreateRole(){
    if(!this.createRoleForm.valid){
      this.pop.showOkPopup({message: "Vui lòng điền đầy đủ thông tin!"})
      return;
    }else{
      if (this.disableBtnNewRole) return;
      
      this.disableBtnNewRole = true;
      this.createRole()

    }
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

  convertToTreeNodes(data: any[]): TreeNode[] {
    return data.map((perm) => ({
      label: perm.description,
      data: perm,
      key: perm.permissionID.toString(),
      leaf: true,
    }));
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

        // const someChildrenSelected = node.children.some((child) =>
        //   selectedNodes.includes(child)
        // );

        // if (
        //   !allChildrenSelected &&
        //   someChildrenSelected &&
        //   !selectedNodes.includes(node)
        // ) {
        //   // Nếu bạn muốn hiển thị trạng thái "một phần được chọn" thì xử lý ở đây (tuỳ chọn)
        //   // PrimeNG không hỗ trợ trạng thái "indeterminate" khi dùng [(selection)] nên có thể bỏ qua
        // }
      }
    });
  }

  assignPermissionForRole() {
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
    
    this.createRoleForm.patchValue({"permissionIds": ids});
    this.displayPopupPermission = false;
  }

  showDialogRolePermission() {
    this.apiPermission.getAllPermission().subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.showPermission();
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

  createRole(){
    this.apiSetting.CreateRole(this.createRoleForm.value).subscribe({
      next: res => {
        if(res.result == '1'){
          this.pop.showOkPopup({message: res.message});
          this.displayDialogNewRole = false;
          this.loadListRole();
        }else{
          this.pop.showOkPopup({message: res.message});
        }
        this.disableBtnNewRole = false;
      },
      error: err=>{
        this.pop.showOkPopup({
          header: 'Lỗi',
          message: 'Không thể kết nối với server!',
        });
        console.log(err);
        this.disableBtnNewRole = false;
      }
    })
  }
  
}
