import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';

import { ModalMessageComponent } from '../../shared/components/modal-message/modal-message.component';
import { UserService } from '../user/services/user.service';
import { User } from '../user/interfaces/user.interface';
import { environment } from '../../../environments/environment';
import { UserDto } from '../../shared/interfaces/userDto.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public model: FormGroup;

  constructor(
    private bsModalService: BsModalService,
    private bsModalRef: BsModalRef,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private service: UserService,
    private router: Router
  ) {
    this.model = this.formBuilder.group({
      login: ['', [Validators.required]],
      password: ['', Validators.required],
      company: this.formBuilder.group({ id: 1, reasonSocial: '' })
    });
   }

  ngOnInit(): void {
    this.model.get('company')?.get('reasonSocial')?.setValue(environment.company.reasonSocial);
  }

  onSubmit(): void {
    if (this.model.valid) {
      let object: User = Object.assign({}, this.model.value);
      object.login = object.login.toUpperCase();
      object.password = object.password.toUpperCase();

      this.spinner.show();
      this.service.login(object).subscribe({
        next: (response) => {
          if (response !== null && response.status == 'ok') {

            if (response.value !== null) {
              let userDto: UserDto = response.value;
              sessionStorage.setItem('userDto', JSON.stringify(userDto));
              this.router.navigate(['/logistics']);

            } else {
              let initialState = { tipo: 3, opcion: 11 };
              this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
            }

            this.spinner.hide();
          } else
            this.errorHandler(response.message);
        },
        error: (err) => { this.exceptionHandler(err) }
      });
    } else {
      this.model.markAllAsTouched();
      let initialState = { tipo: 3, opcion: 10 };
      this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
    }
  }

  private errorHandler(error: string) {
    this.spinner.hide();
    let initialState: any = { tipo: 3, textoPredeterminado: error };
    this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, class: 'modal-dialog-custom' });
  }

  private exceptionHandler(exception: any) {
    this.spinner.hide();
    let message: string = '¡Existe un problema al acceder al servidor, contactese con soporte!';

    if (exception.status == '401')
      message = '¡No tiene permisos suficientes para utilizar este modulo, inicie sesión nuevamente!';

    let initialState: any = { tipo: 2, textoPredeterminado: message };
    this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, class: 'modal-dialog-custom' });
  }
}
