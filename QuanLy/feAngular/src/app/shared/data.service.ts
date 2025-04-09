import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  private page404Content = new BehaviorSubject<string>('')

  curPage404Content = this.page404Content.asObservable();

  changePage404Content(content: string){
    this.page404Content.next(content);
  }
}
