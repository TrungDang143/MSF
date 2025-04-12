import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { PopupOkComponent } from './shared/popup/popup-ok/popup-ok.component';
import { PopupYesNoComponent } from './shared/popup/popup-yes-no/popup-yes-no.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, PopupOkComponent, PopupYesNoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Home';
}
