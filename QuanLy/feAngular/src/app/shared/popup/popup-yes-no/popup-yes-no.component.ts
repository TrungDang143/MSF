import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ConfirmDialogData, PopupService } from '../popup.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-popup-yes-no',
  templateUrl: './popup-yes-no.component.html',
  standalone: true,
  imports: [
    Dialog, ButtonModule
  ],
  styleUrls: ['./popup-yes-no.component.css']
})
export class PopupYesNoComponent {
  visible = false;
  data: ConfirmDialogData | null = null;

  constructor(private popup: PopupService) {
    this.popup.confirmDialog$.subscribe((data) => {
      this.data = data;
      this.visible = true;
    });
  }

  handleAccept() {
    this.data?.onAccept?.();
    this.visible = false;
  }

  handleReject() {
    this.data?.onReject?.();
    this.visible = false;
  }
}
