import { Injectable } from '@angular/core';
import { DataService } from '../shared/data.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Page404Service {

  constructor(private data: DataService, private router: Router) { }

  show404(content: string){
    this.data.changePage404Content(content);
    this.router.navigate(['/page-404']);
  }
}
