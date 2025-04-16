import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../shared/auth.service';
import { HomeService } from '../../services/home.service';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PopupService } from '../../shared/popup/popup.service';
import { SidebarModule } from 'primeng/sidebar';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { MenubarModule } from 'primeng/menubar';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { CardModule } from 'primeng/card';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { BreadcrumbService } from '../../shared/breadcrumb.service';
import { MenuItem } from 'primeng/api';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/internal/operators/filter';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    SidebarModule,
    MenuModule,
    AvatarModule,
    MenubarModule,
    InputGroupModule,
    InputGroupAddonModule,
    CardModule,
    BreadcrumbModule,
    RouterOutlet,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private apiHome: HomeService,
    private router: Router,
    private pop: PopupService,
    private breadcrumbService: BreadcrumbService
  ) {}

  menuAccountitems = [
    {
      label: 'Options',
      items: [
        {
          label: 'Cài đặt tài khoản',
          icon: 'pi pi-user-edit',
          routerLink: ['/home/my-account'],
        },
        {
          label: 'Đăng xuất',
          icon: 'pi pi-sign-out',
          command: () => this.Logout(),
        },
      ],
    },
  ];

  collapsed = false;

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  breadcrumbItems: MenuItem[] = [];
  breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/home/dashboard' };

  username: string = '###';
  avatar: string = 'favicon.ico';
  ngOnInit(): void {
    this.getFullName();
  }

  getFullName() {
    this.apiHome.getFullName().subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.username = res.data;
        }
      },
      error: (err) => {
        console.log('Lỗi lấy username', err);
      },
    });
  }

  Logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  goToPage(url: string, permission: string) {
    if (permission && !this.auth.hasPermission(permission)) {
      this.pop.showOkPopup({
        message: 'Bạn không có quyền truy cập trang này!',
      });
    } else {
      console.log('Navigating to:', url);
      this.router.navigate(['/home' + url]).then(() => {
        // Chờ route cập nhật xong
        this.router.events
          .pipe(filter(event => event instanceof NavigationEnd))
          .subscribe(() => {
            this.breadcrumbItems = this.breadcrumbService.getBreadcrumbs();
          });
      });
    }
  }
}
