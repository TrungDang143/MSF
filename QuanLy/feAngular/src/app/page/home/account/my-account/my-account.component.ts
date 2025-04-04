import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, input, OnInit } from '@angular/core';
import { environment } from '../../../../shared/environment';
import { Route, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-account',
  imports: [],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.css',
})

export class MyAccountComponent implements OnInit {
  constructor(private http: HttpClient, private router: Router) {}

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
            this.router.navigate(['/page-404'], { state: { message: 'Trang bạn tìm không tồn tại!' } });
          } else {

          }
        },
      });
  }
}
