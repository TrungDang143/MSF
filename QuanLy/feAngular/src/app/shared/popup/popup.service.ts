
import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Subject } from 'rxjs/internal/Subject';

export interface ConfirmDialogData {
  message: string;
  header?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  icon?: string;
  onAccept?: () => void;
  onReject?: () => void;
}
export interface InfoDialogData {
  message: string;
  header?: string;
  okLabel?: string;
  icon?: string;
  onClose?: () => void;
}

@Injectable({
  providedIn: 'root', 
})
export class PopupService {

  constructor(private confirmationService: ConfirmationService){}
  
  private confirmDialogSubject = new Subject<ConfirmDialogData>();
  confirmDialog$ = this.confirmDialogSubject.asObservable();

  private infoDialogSubject = new Subject<InfoDialogData>();
  infoDialog$ = this.infoDialogSubject.asObservable();

  showYesNoPopup(data: ConfirmDialogData) {
    this.confirmDialogSubject.next(data);

  }

  showOkPopup(data: InfoDialogData) {
    this.infoDialogSubject.next(data);
  }

  showSysErr(){
    this.infoDialogSubject.next({header: "Lỗi", message: "Không thể kết nối tới Server!", icon: "pi pi-times-circle"});
  }

}
