import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ApplicationDto, UserDto } from '../../interfaces/userDto.interface';
import { environment } from '../../../../environments/environment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalMessageComponent } from '../modal-message/modal-message.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  public userDto: UserDto;

  constructor(
    private router: Router
    ,private bsModalService: BsModalService
    ,public bsModalRef: BsModalRef
  ) {
    this.userDto = JSON.parse(sessionStorage.getItem('userDto')!);
    environment.user.id = this.userDto.id;
    environment.user.name = this.userDto.name;
  }

  public exit() {
    let initialState = { tipo: 3, opcion: 9 };
    this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
    this.bsModalRef.content.response.subscribe((value: any) => {
      if (value === 'ok') {
        this.router.navigate(['/login']);
      }
    });
  }
}
