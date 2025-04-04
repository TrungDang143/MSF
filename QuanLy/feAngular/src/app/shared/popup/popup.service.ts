
import { Injectable } from '@angular/core';
import { PopupOkComponent } from './popup-ok/popup-ok.component';
import { MatDialog } from '@angular/material/dialog';
import { PopupYesNoComponent } from './popup-yes-no/popup-yes-no.component';

@Injectable({
  providedIn: 'root', 
})
export class PopupService {
  constructor(private dialog: MatDialog){}
  
  showOkPopup(caption: string = 'Thông báo', message: string) {
    this.dialog.open(PopupOkComponent, {
      data: { caption: caption, message: message },
    });
  }

  showYesNoPopup(caption: string, message: string) {
    const dialogRef = this.dialog.open(PopupYesNoComponent, {
      data: { caption: caption, message: message },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Result:', result); 
    });
  }
}
