import { Component, Inject } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { InfoDialogData, PopupService } from '../popup.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-popup-ok',
  templateUrl: './popup-ok.component.html',
  standalone: true,
  imports: [
    Dialog, ButtonModule, CommonModule
  ],
  styleUrls: ['./popup-ok.component.css'],
})
export class PopupOkComponent {
  visible = false;
  data: InfoDialogData | null = null;

  constructor(private popup: PopupService) {
    this.popup.infoDialog$.subscribe(data => {
      this.data = data;
      this.visible = true;
    });
  }

  handleOk() {
    this.visible = false;
    this.data?.onClose?.(); // Nếu có callback sau khi đóng
  }
}
