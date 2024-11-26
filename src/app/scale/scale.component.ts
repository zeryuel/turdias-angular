import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-scale',
  standalone: true,
  imports: [NavbarComponent, RouterModule, NgxSpinnerModule],
  templateUrl: './scale.component.html'
})
export class ScaleComponent {

}
