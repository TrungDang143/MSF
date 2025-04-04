import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-page-404',
  imports: [],
  templateUrl: './page-404.component.html',
  styleUrl: './page-404.component.css'
})
export class Page404Component {
  message: string = 'Trang không tìm thấy';
  
  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['message']) {
      this.message = navigation.extras.state['message'];
    }
    console.log('navi', navigation)
  }
}
