import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

import { ModalMessageComponent } from '../../shared/components/modal-message/modal-message.component';
import { PageNumber, Table } from '../../shared/interfaces/table.interface';
import { Paged } from '../../shared/interfaces/paged.interface';
import { Page } from '../../shared/interfaces/page.interface';
import { UserService } from './services/user.service';
import { SettingUser } from './interfaces/setting-user.interface';
import { UserApplication } from './interfaces/user-application.interface';
import { User } from './interfaces/user.interface';
import { ModalApplicationComponent } from '../shared/components/modal-application/modal-application.component';
import { UserRoleComponent } from './components/user-role/user-role.component';
import { Application } from '../application/interfaces/application.interface';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './user.component.html'
})
export class UserComponent {
  @ViewChild('filterName') filterName!: ElementRef;

  public model: FormGroup;
  public paged: FormGroup;
  public setting: SettingUser;
  public table: Table;
  public table2: Table;

  constructor(
    private bsModalService: BsModalService,
    public bsModalRef: BsModalRef,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private service: UserService
  ) {
    this.model = this.formBuilder.group({
      id: '',
      name: ['', Validators.required],
      login: ['', Validators.required],
      password: ['', Validators.required],
      lstUserApplication: Array<UserApplication>,
    });
    this.model.get('lstUserApplication')?.setValue([]);

    this.paged = this.formBuilder.group({
      pageSize: 10,
      pageNumber: 1,
      orderColumn: 'usr.id',
      order: 'ASC',
      lstFilter: this.formBuilder.array(
        [
          this.formBuilder.group({ object: 'usr', column: 'name', value: ['', Validators.pattern(/^[a-zA-Z0-9 ]+$/)], operator: 'like' }),
          this.formBuilder.group({ object: 'usr', column: 'active', value: true, operator: 'equal' })
        ]
      )
    });

    this.setting = {
      recordId: 0,
      recordId2: 0,
      operation: '',
      onlyView: true,
      mainScreen: false,
    };

    this.table = {
      pageNumber: 1,
      pageSize: 10,
      orderColumn: -1,
      hight: 372,
      totalPages: 1,
      totalElements: 0,
      startElement: 0,
      endElement : 0,
      content: [],
      lstColumn: [
        { name: 'N°', width: '5%', style: 'text-center' },
        { name: 'CODIGO', width: '10%', style: 'text-center' },
        { name: 'NOMBRE', width: '75%', style: 'text-left' },
        { name: 'ESTADO', width: '10%', style: 'text-center' }
      ],
      lstPageSize: [
        { id: 10, name: '10' },
        { id: 30, name: '30' },
        { id: 50, name: '50' }
      ],
      lstPageNumber:[
        { value: 'Anterior', style: 'page-item disabled' },
        { value: 'Siguiente', style: 'page-item disabled' }
      ]
    };

    this.table2 = {
      pageNumber: 1,
      pageSize: 10,
      orderColumn: -1,
      hight: 372,
      totalPages: 1,
      totalElements: 0,
      startElement: 0,
      endElement : 0,
      content: [],
      lstColumn: [
        { name: 'N°', width: '5%', style: 'text-center' },
        { name: 'CÓDIGO', width: '10%', style: 'text-center' },
        { name: 'SISTEMA', width: '75%', style: 'text-start' },
        { name: 'CANT. ROLES', width: '10%', style: 'text-center' }

      ],
      lstPageSize: [
        { id: 10, name: '10' },
        { id: 30, name: '30' },
        { id: 50, name: '50' }
      ],
      lstPageNumber:[
        { value: 'Anterior', style: 'page-item disabled' },
        { value: 'Siguiente', style: 'page-item disabled' }
      ]
    };
  }

  ngOnInit(): void {
    let object: Paged = Object.assign({}, this.paged.value);
    this.spinner.show();
    this.service.setting(object).subscribe({
      next: (response) => {
        if (response !== null && response.status == 'ok') {
          this.paginationMapper(response.value.page.value, this.table);
          this.spinner.hide()
        } else
          this.errorHandler(response.message);
      },
      error: (err) => { this.exceptionHandler(err) }
    })
  }

  public search() {
    if (this.paged.valid) {

      let object: Paged = Object.assign({}, this.paged.value);
      object.pageNumber = object.pageNumber == 0 ? 1 : object.pageNumber;

      this.spinner.show()
      this.service.findByPagination(object).subscribe({
        next: (response) => {
          if (response !== null && response.status == 'ok') {
            this.paginationMapper(response.value, this.table);
            this.setting.recordId = 0;
            this.spinner.hide();
          } else
            this.errorHandler(response.message);
        },
        error: (err) => { this.exceptionHandler(err) }
      })

    } else {
      this.paged.markAllAsTouched();
      let initialState = { tipo: 3, opcion: 10 };
      this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
    }
  }

  public create() {
    this.setting.mainScreen = true;
    this.setting.operation = 'NUEVO';
    this.setting.onlyView = false;
    this.tableMapper(this.model.get('lstUserApplication')?.value, this.table2);
  }

  public update() {
    this.setting.mainScreen = true;
    this.setting.operation = 'MODIFICAR';
    this.setting.onlyView = false;

    let object: any = { id: this.setting.recordId };

    this.spinner.show()
    this.service.findById(object).subscribe({
      next: (response) => {
        if (response !== null && response.status == 'ok') {
          this.model.patchValue(response.value);
          this.model.get('id')?.setValue(this.pad(this.model.get('id')?.value, 4, 0));
          this.tableMapper(this.model.get('lstUserApplication')?.value, this.table2);
          this.spinner.hide();
        } else
          this.errorHandler(response.message);
      },
      error: (err) => { this.exceptionHandler(err) }
    })
  }

  public delete() {
    let initialState = { tipo: 3, opcion: 1 }
    this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
    this.bsModalRef.content.response.subscribe((value: any) => {

      if (value === 'ok') {
        let object: any = { id: this.setting.recordId };

        this.spinner.show()
        this.service.delete(object).subscribe({
          next: (response) => {
            if (response !== null && response.status == 'ok') {
              this.setting.recordId = 0;

              setTimeout(() => {
                initialState = { tipo: 4, opcion: 1 };
                this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
                this.search();
              }, 200);
            } else
               setTimeout(() => { this.errorHandler(response.message) }, 200);
          },
          error: (err) => { this.exceptionHandler(err) }
        })
      }
    })
  }

  public view() {
    this.update();
    this.setting.operation = 'VISUALIZAR';
    this.setting.onlyView = true;
  }

  public save() {
    if (this.model.valid) {
      let object: User = Object.assign({}, this.model.value);
      object.id = object.id.toString() == '' ? 0 : object.id;
      object.name = object.name.toUpperCase();
      object.login = object.login.toUpperCase();
      object.password = object.password.toUpperCase();

      let array: Array<UserApplication> = this.model.get('lstUserApplication')?.value;
      if (array.length == 0) {
        let initialState = { tipo: 3, opcion: 12 };
        this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
        return;
      }

      if (object.id == 0) {
        this.spinner.show();
        this.service.insert(object).subscribe({
          next: (response) => {
            if (response !== null && response.status == 'ok') {
              this.model.get('id')?.setValue(this.pad(response.value, 4, 0));

              let initialState: any = { tipo: 1, opcion: 1 }
              this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
              this.bsModalRef.content.response.subscribe(() => { this.exit(true) })
              this.spinner.hide();
            } else
              this.errorHandler(response.message);
          },
          error: (err) => { this.exceptionHandler(err) }
        });

      } else {
        this.spinner.show();
        this.service.update(object).subscribe({
          next: (response) => {
            if (response !== null && response.status == 'ok') {
              let initialState: any = { tipo: 1, opcion: 2 }
              this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
              this.bsModalRef.content.response.subscribe(() => { this.exit(true) })
              this.spinner.hide();
            } else
              this.errorHandler(response.message);
          },
          error: (err) => { this.exceptionHandler(err) }
        })
      }
    } else {
      this.model.markAllAsTouched()
      let initialState = { tipo: 3, opcion: 10 }
      this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
    }
  }

  public exit(updatedRecord?: boolean) {
    this.model.reset({
      id: '',
      name: '',
      login: '',
      password: ''
    });
    this.model.get('lstUserApplication')?.setValue([]);
    this.model.get('lstUserRole')?.setValue([]);

    this.setting.onlyView = true;
    this.setting.mainScreen = false;
    this.setting.recordId2 = 0;

    if (updatedRecord) {
      this.setting.recordId = 0;
      this.search();
    }
  }

  public selectRecord(record: any) {
    this.setting.recordId = record.id;
  }

  public selectRecord2(record: any) {
    this.setting.recordId2 = record.idApplication;
  }

  public addApplication() {
    this.bsModalRef = this.bsModalService.show(ModalApplicationComponent, { class: 'modal-lg modal-dialog-centered', backdrop: 'static'})
    this.bsModalRef.content.response.subscribe((response: Application) => {
      if (response != null) {
        let array: Array<UserApplication> = this.model.get('lstUserApplication')?.value;
        let exist: UserApplication = array.find(x => x.idApplication == response.id)!;

        if (exist == undefined) {
          let object: UserApplication = {
            idUser: 0,
            idApplication: response.id,
            access: 1,
            userName: '',
            applicationName: response.name,
            lstUserApplicationRole: []
          };

          array.push(object);
          this.tableMapper(this.model.get('lstUserApplication')?.value, this.table2);
        }
        else {
          let initialState = { tipo: 4, opcion: 6 }
          this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
        }
      }
    })
  }

  public removeApplication() {
    let array: Array<UserApplication> = this.model.get('lstUserApplication')?.value;
    let index: number = array.findIndex(x => x.idApplication == this.setting.recordId2);
    array.splice(index, 1);

    this.tableMapper(this.model.get('lstUserApplication')?.value, this.table2);
    this.setting.recordId2 = 0;
  }

  public roles() {
    let array: Array<UserApplication> = this.model.get('lstUserApplication')?.value;
    let index: number = array.findIndex(x => x.idApplication == this.setting.recordId2);
    let object: UserApplication = array[index];

    let initialState = { object };
    this.bsModalRef = this.bsModalService.show(UserRoleComponent, { initialState, class: 'modal-xl-custom modal-dialog-centered', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: UserApplication) => {
      if (response != null) {
      }
    })
  }

  public paginationMapper(page: Page, table: Table) {
    let value: number;
    let startPage: number;
    let endPage: number;

    table.lstPageNumber = [];
    table.content = page.content;
    table.pageNumber = page.pageable.pageNumber + 1;
    table.pageSize = page.pageable.pageSize;
    table.totalElements = page.totalElements;
    table.startElement = 0;
    table.endElement = 0;

    if (table.pageNumber > 0) {
      value = (Math.floor(table.pageNumber / 5));
      value = (table.pageNumber % 5 == 0) ? (value - 1) : value;

      startPage = (5 * value) + 1;
      endPage = 5 * (value + 1);

      if (endPage >= page.totalPages)
        endPage = page.totalPages;

      if (table.pageNumber == 1)
        table.lstPageNumber.push({ value: 'Anterior', style: 'page-item disabled' });
      else
        table.lstPageNumber.push({ value: 'Anterior', style: 'page-item' });

      for (let i = startPage; i <= endPage; i++) {
        if (table.pageNumber == i)
          table.lstPageNumber.push({ value: String(i), style: 'page-item active' });
        else
          table.lstPageNumber.push({ value: String(i), style: 'page-item' });
      }

      if (table.pageNumber == page.totalPages)
        table.lstPageNumber.push({ value: "Siguiente", style: 'page-item disabled' });

      else {
        if (page.totalPages == 0)
          table.lstPageNumber.push({ value: "Siguiente", style: 'page-item disabled' });
        else
          table.lstPageNumber.push({ value: "Siguiente", style: 'page-item' });
      }
    } else {
      table.lstPageNumber.push({ value: 'Anterior', style: 'page-item disabled' });
      table.lstPageNumber.push({ value: 'Siguiente', style: 'page-item disabled' });
    }

    if (table.content.length > 0 )
      table.startElement = 1 + (table.pageSize * (table.pageNumber - 1));

    table.endElement = page.numberOfElements + (table.pageSize * (table.pageNumber - 1));
  }

  public paginationManager(pageNumber: PageNumber, table: Table) {
    switch (pageNumber.value) {
      case '<<<':
        this.paged.get('pageNumber')?.setValue(1);
        break;

      case '>>>':
        this.paged.get('pageNumber')?.setValue(table.totalPages);
        break;

      case 'Siguiente':
        this.paged.get('pageNumber')?.setValue(this.paged.get('pageNumber')?.value + 1);
        break;

      case 'Anterior':
        this.paged.get('pageNumber')?.setValue(this.paged.get('pageNumber')?.value - 1);
        break;

      default:
        this.paged.get('pageNumber')?.setValue(parseInt(pageNumber.value, 0));
        break;
    }

    this.search();
  }

  public tableMapper(array: any[], table: Table) {
    table.totalElements = array.length;
    table.content = array;
  }

  public onKeyPressAlfaNumerico(event: any) {
    let pattern = /^[a-zA-Z0-9 ]+$/
    let inputChar = String.fromCharCode(event.charCode)

    if (!pattern.test(inputChar)) {
      event.preventDefault()
    }
  }

  private pad(n: any, width: number, z: any) {
    z = z || '0'
    n = n + ''

    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
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
