import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/auth.service';
import { HomeService } from '../../services/home.service';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PopupService } from '../../shared/popup/popup.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ButtonModule, RouterOutlet, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {

  constructor(private auth: AuthService, private apiHome: HomeService, private router: Router, private pop: PopupService ) {}
 
  username: string = '###';
  ngOnInit(): void {
    this.getFullName();

  }

  getFullName(){
    this.apiHome.getFullName().subscribe({
      next: (res) =>{
        if(res.result == '1'){
          this.username = res.data
        }
      },
      error: (err)=>{
        console.log('Lỗi lấy username', err);
      }
    })
  }

  Logout(){
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  goToPage(url: string, permission: string) {
    if(permission && !this.auth.hasPermission(permission)){
      this.pop.showOkPopup({message: 'Bạn không có quyền truy cập chức năng này!'});
    }
    else{
      console.log('Navigating to:', url);
      this.router.navigate(['/home' + url]);
    }
  }
}
