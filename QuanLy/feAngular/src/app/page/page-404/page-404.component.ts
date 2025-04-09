import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from '../../shared/data.service';

@Component({
  selector: 'app-page-404',
  imports: [RouterLink],
  templateUrl: './page-404.component.html',
  styleUrl: './page-404.component.css'
})
export class Page404Component {
  message: string = 'Trang không tìm thấy';
  
  constructor(private router: Router, private data: DataService) {}

  ngOnInit(): void {

    this.data.curPage404Content.subscribe(dt =>{
      this.message = dt;
    })
  }
  
}
