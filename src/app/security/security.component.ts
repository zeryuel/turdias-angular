import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [NavbarComponent, RouterModule, NgxSpinnerModule],
  templateUrl: './security.component.html'
})
export class SecurityComponent {

}
