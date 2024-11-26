import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

import { AuthorizePurchaseService } from './services/authorize-purchase.service';
import { AuthorizerService } from '../authorizer/services/authorizer.service';
import { ModalMessageComponent } from '../../shared/components/modal-message/modal-message.component';
import { environment } from '../../../environments/environment';
import { PageNumber, Table } from '../../shared/interfaces/table.interface';
import { Paged } from '../../shared/interfaces/paged.interface';
import { Page } from '../../shared/interfaces/page.interface';
import { SettingAuthorizePurchase } from './interfaces/setting-authorize-purchase.interface';
import { PurchaseOrder } from '../purchase-order/interfaces/purchase-order.interface';

@Component({
  selector: 'app-authorize-purchase',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule, BsDatepickerModule, FormsModule],
  templateUrl: './authorize-purchase.component.html'
})
export class AuthorizePurchaseComponent {
  @ViewChild('chkSelectAll') chkSelectAll!: ElementRef;

  public paged: FormGroup;
  public setting: SettingAuthorizePurchase;
  public table: Table;
  private lstPurchaseOrder: Array<PurchaseOrder>;

  constructor(
    private bsModalService: BsModalService,
    private bsModalRef: BsModalRef,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private service: AuthorizePurchaseService,
    private serviceAuthorizer: AuthorizerService
  ) {
    this.lstPurchaseOrder = [];

    this.paged = this.formBuilder.group({
      pageSize: 10,
      pageNumber: 1,
      orderColumn: 'purchaseOrder.purchase_date',
      order: 'ASC',
      lstFilter: this.formBuilder.array(
        [
          this.formBuilder.group({ object: 'authorizer', column: 'id', value: '', operator: 'equal' }),
          this.formBuilder.group({ object: 'authorizer', column: 'name', value: '' , operator: 'null' }),
          this.formBuilder.group({ object: 'state', column: 'id', value: 11, operator: 'equal' })
        ]
      )
    });

    this.setting = {
      recordId: 0,
      operation: '',
      showButtonPending: false,
      showButtonAuthorize: true,
      showButtonReject: true,
      lstState: []
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
        { name: 'N°', width: '4%', style: 'text-center' },
        { name: 'NUMERO', width: '8%', style: 'text-center' },
        { name: 'TIPO COMPROBANTE', width: '8%', style: 'text-center' },
        { name: 'PROVEEDOR', width: '30%', style: 'text-start' },
        { name: 'FORMA PAGO', width: '8%', style: 'text-center' },
        { name: 'FECHA COMPRA', width: '8%', style: 'text-center' },
        { name: 'MONEDA', width: '8%', style: 'text-center' },
        { name: 'PRECIO VENTA', width: '8%', style: 'text-end' },
        { name: 'ESTADO', width: '10%', style: 'text-center' },
        { name: 'SELECCIONADO', width: '0%', style: 'd-none' },
        { name: 'SELECCIONAR', width: '8%', style: 'text-center' }
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
    let userId: number = environment.user.id;
    let objeto: any = { idUser:userId };

    this.spinner.show();
    this.serviceAuthorizer.findByIdUser(objeto).subscribe({
      next: (response) => {
        if (response !== null && response.status == 'ok') {
          let lstFilter = this.paged.get('lstFilter') as FormArray;

          if (response.value.id !== null) {
            lstFilter.controls[0].get('value')?.setValue(response.value.id);
            lstFilter.controls[1].get('value')?.setValue(response.value.name);
            this.configuration();
          }
          this.spinner.hide();
        } else
        this.errorHandler(response.message);
      },
      error: (err) => { this.exceptionHandler(err) }
    });
  }

  private configuration() {
    let object: Paged = Object.assign({}, this.paged.value);
    this.spinner.show();
    this.service.setting(object).subscribe({
      next: (response) => {
        if (response !== null && response.status == 'ok') {
          this.paginationMapper(response.value.page.value, this.table);
          this.setting.lstState = response.value.lstState.value;
          this.spinner.hide();
        } else
        this.errorHandler(response.message);
      },
      error: (err) => { this.exceptionHandler(err) }
    });
  }

  public search() {
    if (this.paged.valid) {

      let object: Paged = Object.assign({}, this.paged.value);
      object.pageNumber = object.pageNumber == 0 ? 1 : object.pageNumber;

      this.spinner.show();
      this.service.findByPagination(object).subscribe({
        next: (response) => {
          if (response !== null && response.status == 'ok') {
            this.paginationMapper(response.value, this.table);
            this.setting.recordId = 0;
            this.chkSelectAll.nativeElement.checked = false;
            this.lstPurchaseOrder = [];
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

  public pending() {
    if (this.lstPurchaseOrder.length == 0) {
      let initialState = { tipo: 3, opcion: 19 };
      this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
      return;
    }

    let initialState = { tipo: 3, opcion: 13 };
    this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
    this.bsModalRef.content.response.subscribe((value: any) => {

      if (value === 'ok') {
        this.spinner.show();
        this.service.pending(this.lstPurchaseOrder).subscribe({
          next: (response) => {
            if (response !== null && response.status == 'ok') {
              setTimeout(() => {
                initialState = { tipo: 1, opcion: 1 };
                this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
                this.search();
              }, 200);
            } else
              setTimeout(() => { this.errorHandler(response.message); }, 200);
          },
          error: (err) => { this.exceptionHandler(err) }
        });
      }
    })
  }

  public authorize() {
    if (this.lstPurchaseOrder.length == 0) {
      let initialState = { tipo: 3, opcion: 19 };
      this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
      return;
    }

    let initialState = { tipo: 3, opcion: 14 };
    this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
    this.bsModalRef.content.response.subscribe((value: any) => {

      if (value === 'ok') {
        this.spinner.show();
        this.service.authorize(this.lstPurchaseOrder).subscribe({
          next: (response) => {
            if (response !== null && response.status == 'ok') {

              setTimeout(() => {
                initialState = { tipo: 1, opcion: 1 };
                this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
                this.search();
              }, 200);
            } else
              setTimeout(() => { this.errorHandler(response.message); }, 200);
          },
          error: (err) => { this.exceptionHandler(err) }
        });
      }
    })
  }

  public reject() {
    if (this.lstPurchaseOrder.length == 0) {
      let initialState = { tipo: 3, opcion: 19 };
      this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
      return;
    }

    let initialState = { tipo: 3, opcion: 15 };
    this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
    this.bsModalRef.content.response.subscribe((value: any) => {

      if (value === 'ok') {
        this.spinner.show();
        this.service.reject(this.lstPurchaseOrder).subscribe({
          next: (response) => {
            if (response !== null && response.status == 'ok') {
              setTimeout(() => {
                initialState = { tipo: 1, opcion: 1 };
                this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
                this.search();
              }, 200);
            } else
              setTimeout(() => { this.errorHandler(response.message); }, 200);
          },
          error: (err) => { this.exceptionHandler(err) }
        });
      }
    })
  }

  public selectRecord(record: any, event: any) {
    let {checked, value} = event.target;

    if(checked) {
      this.lstPurchaseOrder.push(record);
    } else {
      let index: number = this.lstPurchaseOrder.findIndex(x => x.id == record.id);
      this.lstPurchaseOrder.splice(index, 1);
    }
  }

  public selectAll(event: any){
    let {checked} = event.target;
    let arrayFila = this.paged.get('lstFila')?.value;
    let arrayCheckbox = (<HTMLInputElement[]><any>document.getElementsByName('chkSelect'));

    this.lstPurchaseOrder = [];
    if(checked) {
      for (let item of this.table.content ) {
        this.lstPurchaseOrder.push(item);
      }
    }

    for(let i=0, n=arrayCheckbox.length; i<n; i++) {
      arrayCheckbox[i].checked = checked;
    }
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

  public onChangeState() {
    let idState: number = parseInt(this.paged.get('lstFilter')?.value[2].value);
    switch (idState) {
      case 11:
        this.setting.showButtonPending = false;
        this.setting.showButtonAuthorize = true;
        this.setting.showButtonReject = true;
        break;

      case 12:
        this.setting.showButtonPending = true;
        this.setting.showButtonAuthorize = false;
        this.setting.showButtonReject = false;
        break;

      case 13:
        this.setting.showButtonPending = true;
        this.setting.showButtonAuthorize = false;
        this.setting.showButtonReject = false;
        break;

      default:
        console.log("Estado no administrado");
        break;
    };

    this.chkSelectAll.nativeElement.checked = false;
    this.search();
  }

  public onKeyPressAlfaNumerico(event: any) {
    let pattern = /^[a-zA-Z0-9 ]+$/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
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
