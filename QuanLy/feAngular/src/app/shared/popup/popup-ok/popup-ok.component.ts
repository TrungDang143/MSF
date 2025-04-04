import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';


@Component({
  selector: 'app-popup-ok',
  templateUrl: './popup-ok.component.html',
  imports: [
    MatDialogModule,
  ],
  styleUrls: ['./popup-ok.component.css'],
})
export class PopupOkComponent {
  constructor(
    public dialogRef: MatDialogRef<PopupOkComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { caption: string; message: string }
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
