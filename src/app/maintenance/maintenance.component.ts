import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [NavbarComponent, RouterModule, NgxSpinnerModule],
  templateUrl: './maintenance.component.html'
})
export class MaintenanceComponent {

}
