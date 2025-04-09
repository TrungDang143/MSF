import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, input, OnInit } from '@angular/core';
import { environment } from '../../../../shared/environment';
import { Route, Router, RouterLink } from '@angular/router';
import { Page404Component } from '../../../page-404/page-404.component';
import { Page404Service } from '../../../../services/page-404.service';

@Component({
  selector: 'app-my-account',
  imports: [],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.css',
})

export class MyAccountComponent implements OnInit {
  constructor(private http: HttpClient, private router: Router, private page404: Page404Service) {}

  ngOnInit(): void {
    this.getUserInfo();
  }

  getUserInfo() {
    var username =
      localStorage.getItem('user') ?? sessionStorage.getItem('user');
    var params = new HttpParams().set('Username', username!);
    this.http
      .get(environment.baseUrl + 'Account/userInfo', { params })
      .subscribe({
        next: (data) => {
          console.log('Data received:', data);
        },
        error: (err) => {
          if (err.status === 401) {

          } else if (err.status === 403) {

            this.page404.show404('Bạn không có quyền truy cập trang này!');
          } else {

          }
        },
      });
  }
}
