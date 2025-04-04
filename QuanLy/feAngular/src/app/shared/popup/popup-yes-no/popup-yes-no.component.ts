import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-yes-no',
  templateUrl: './popup-yes-no.component.html',
  imports: [
    MatDialogModule,
  ],
  styleUrls: ['./popup-yes-no.component.css']
})
export class PopupYesNoComponent {
  constructor(
    public dialogRef: MatDialogRef<PopupYesNoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { caption: string; message: string }
  ) {}

  choose(response: boolean): void {
    this.dialogRef.close(response);
  }
}
