import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';

import { PageNumber, Table } from '../../shared/interfaces/table.interface';
import { Paged } from '../../shared/interfaces/paged.interface';
import { Page } from '../../shared/interfaces/page.interface';
import { PurchaseOrderService } from './services/purchase-order.service';
import { ModalMessageComponent } from '../../shared/components/modal-message/modal-message.component';
import { PurchaseOrder } from './interfaces/purchase-order.interface';
import { PurchaseOrderDetail } from './interfaces/purchase-order-detail.interface';
import { ModalAuthorizerComponent } from '../shared/components/modal-authorizer/modal-authorizer.component';
import { SettingPurchaseOrder } from './interfaces/setting-purchase-order.interface';
import { ModalSupplierComponent } from '../shared/components/modal-supplier/modal-supplier.component';
import { Supplier } from '../supplier/interfaces/supplier.interface';
import { PurchaseOrderDetailComponent } from './components/purchase-order-detail/purchase-order-detail.component';
import { environment } from '../../../environments/environment';
import { ProofPaymentType } from '../shared/interfaces/proof-payment-type.interface';
import { Currency } from '../shared/interfaces/currency.interface';
import { Authorizer } from '../authorizer/interfaces/authorizer.interface';
import { map, Observable, Observer, of, switchMap, tap } from 'rxjs';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

import { Response } from '../../shared/interfaces/response.interface';

@Component({
  selector: 'app-purchase-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule, BsDatepickerModule, FormsModule, TypeaheadModule],
  templateUrl: './purchase-order.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchaseOrderComponent implements OnInit {
  @ViewChild('filterId') filterId!: ElementRef;
  @ViewChild('chkIncludeTax') chkIncludeTax!: ElementRef;

  public model: FormGroup;
  public paged: FormGroup;
  public setting: SettingPurchaseOrder;
  public table: Table;
  public table2: Table;

  dataSupplier$?: Observable<Supplier[]>;
  errorSupplier?: string;

  constructor(
    private bsModalService: BsModalService,
    private bsModalRef: BsModalRef,
    private bsLocaleService: BsLocaleService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private service: PurchaseOrderService
  ) {
    this.bsLocaleService.use('es');

    this.model = this.formBuilder.group({
      id: '',
      idHeadquarters: 0,
      purchaseDate: [moment().format('DD/MM/YYYY'), Validators.required],
      deliveryDate: [moment().format('DD/MM/YYYY'), Validators.required],
      observation: '',
      creditDays: 0,
      exchangeRate: 0,
      includeTax: 0,
      totalItems: 0,
      taxValue: 0,
      saleValue: '0.00',
      salePrice: '0.00',
      saleTax: '0.00',
      proofPaymentType: this.formBuilder.group({ id: 1 }),
      supplier: this.formBuilder.group({ id: ['', [Validators.required]], ruc: '', reasonSocial: '' }),
      authorizer: this.formBuilder.group({ id: ['', [Validators.required]], name: '' }),
      paymentMethod: this.formBuilder.group({ id: 1, name: '' }),
      currency: this.formBuilder.group({ id: 1, name: '' }),
      state: this.formBuilder.group({ id: 11, name: '', icon: '', color: '' }),
      lstPurchaseOrderDetail: Array<PurchaseOrderDetail>
    });
    this.model.get('lstPurchaseOrderDetail')?.setValue([]);

    this.paged = this.formBuilder.group({
      pageSize: 10,
      pageNumber: 1,
      orderColumn: 'purchaseOrder.id',
      order: 'DESC',
      lstFilter: this.formBuilder.array(
        [
          this.formBuilder.group({ object: 'purchaseOrder', column: 'id', value: ['', Validators.pattern(/^[a-zA-Z0-9 ]+$/)], operator: 'equal' }),
          this.formBuilder.group({ object: 'proofPaymentType', column: 'id', value: '', operator: 'equal' }),
          this.formBuilder.group({ object: 'supplier', column: 'id', value: '', operator: 'equal' }),
          this.formBuilder.group({ object: 'purchaseOrder', column: 'purchase_date', value: '', operator: 'rangeDate' }),
          this.formBuilder.group({ object: 'state', column: 'id', value: '', operator: 'equal' })
        ]
      )
    });

    this.setting = {
      recordId: 0,
      recordId2: 0,
      operation: '',
      onlyView: false,
      mainScreen: false,
      currencyAcronym: '',
      taxValue: 0,
      stateId: 0,
      filterSupplier: '',
      filterRangeDate: [],
      lstProofPaymentType: [],
      lstPaymentMethod: [],
      lstCurrency: [],
      lstState: []
    }

    this.table = {
      pageNumber: 1,
      pageSize: 10,
      orderColumn: -1,
      hight: 372,
      totalPages: 1,
      totalElements: 0,
      startElement: 0,
      endElement: 0,
      content: [],
      lstColumn: [
        { name: 'N°', width: '4%', style: 'text-center' },
        { name: 'NUMERO', width: '6%', style: 'text-center' },
        { name: 'TIPO COMPROBANTE', width: '8%', style: 'text-center' },
        { name: 'PROVEEDOR', width: '30%', style: 'text-start' },
        { name: 'FORMA PAGO', width: '6%', style: 'text-center' },
        { name: 'FECHA COMPRA', width: '8%', style: 'text-center' },
        { name: 'MONEDA', width: '6%', style: 'text-center' },
        { name: 'VALOR VENTA', width: '8%', style: 'text-end' },
        { name: 'IMPUESTO', width: '8%', style: 'text-end' },
        { name: 'PRECIO VENTA', width: '8%', style: 'text-end' },
        { name: 'ESTADO', width: '8%', style: 'text-center' }
      ],
      lstPageSize: [
        { id: 10, name: '10' },
        { id: 30, name: '30' },
        { id: 50, name: '50' }
      ],
      lstPageNumber: [
        { value: 'Anterior', style: 'page-item disabled' },
        { value: 'Siguiente', style: 'page-item disabled' }
      ]
    }

    this.table2 = {
      pageNumber: 1,
      pageSize: 10,
      orderColumn: -1,
      hight: 372,
      totalPages: 1,
      totalElements: 0,
      startElement: 0,
      endElement: 0,
      content: [],
      lstColumn: [
        { name: 'N°', width: '3%', style: 'text-center' },
        { name: 'CÓDIGO', width: '5%', style: 'text-center' },
        { name: 'PRODUCTO', width: '20%', style: 'text-start' },
        { name: 'MARCA', width: '7%', style: 'text-start' },
        { name: 'UND. MEDIDA', width: '7%', style: 'text-start' },
        { name: 'CENTRO DE COSTO', width: '14%', style: 'text-start' },
        { name: 'CANTIDAD', width: '6%', style: 'text-end' },
        { name: 'VALOR UNT.', width: '7%', style: 'text-end' },
        { name: 'SUB TOTAL', width: '7%', style: 'text-end' },
        { name: 'IMPUESTO', width: '7%', style: 'text-end' },
        { name: 'TOTAL', width: '7%', style: 'text-end' }
      ],
      lstPageSize: [
        { id: 10, name: '10' },
        { id: 30, name: '30' },
        { id: 50, name: '50' }
      ],
      lstPageNumber: [
        { value: 'Anterior', style: 'page-item disabled' },
        { value: 'Siguiente', style: 'page-item disabled' }
      ]
    }
  }

  ngOnInit(): void {
    let object: Paged = Object.assign({}, this.paged.value);
    this.spinner.show();
    this.service.setting(object).subscribe({
      next: (response) => {
        if (response !== null && response.status == 'ok') {
          this.paginationMapper(response.value.page.value, this.table);
          this.setting.lstProofPaymentType = response.value.lstProofPaymentType.value;
          this.setting.lstPaymentMethod = response.value.lstPaymentMethod.value;
          this.setting.lstCurrency = response.value.lstCurrency.value;
          this.setting.lstState = response.value.lstState.value;

          let proofPaymentType: ProofPaymentType = this.getProofPaymentType(this.model.get('proofPaymentType')?.get('id')?.value);
          let currency: Currency = this.getCurrency(this.model.get('currency')?.get('id')?.value);
          this.setting.taxValue = proofPaymentType.taxValue;
          this.setting.currencyAcronym = currency.acronym;

          this.filterId.nativeElement.focus();
          this.spinner.hide();
        } else
          this.errorHandler(response.message);
      },
      error: (err) => { this.exceptionHandler(err) }
    });

    let object1: Paged = {
      pageSize: 20,
      pageNumber: 1,
      orderColumn: "supplier.reason_social",
      order: "ASC",
      lstFilter: [{ object: "supplier", column: "reason_social", value: "", operator: "like" }]
    }

    this.dataSupplier$ = new Observable((observer: Observer<string | undefined>) => {
      observer.next(this.model.get('reasonSocial')?.value);
    }).pipe(
      switchMap((query: string) => {
        if (query) {
          object1.lstFilter[0].value = query;

          return this.service.findByPagination(object1).pipe(
            map((data: Response<Page>) => data && data.value.content || []),
            tap({
              next: x => { },
              error: err => { this.errorSupplier = err && err.message || 'Error en la consulta'; }
            })
          );
        }

        return of([]);
      })
    );
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
    this.setting.operation = 'NUEVO';
    this.setting.mainScreen = true;
    this.setting.onlyView = false;
    this.tableMapper(this.model.get('lstPurchaseOrderDetail')?.value, this.table2);
  }

  public update() {
    this.setting.operation = 'MODIFICAR';
    this.setting.mainScreen = true;

    let object: any = { id: this.setting.recordId };

    this.spinner.show();
    this.service.findById(object).subscribe({
      next: (response) => {
        if (response !== null && response.status == 'ok') {
          this.model.patchValue(response.value);
          this.model.get('id')?.setValue(this.pad(this.model.get('id')?.value, 5, 0));

          if (this.model.get('state')?.get('id')?.value == 11)
            this.setting.onlyView = false;
          else
            this.setting.onlyView = true;

          if (this.model.get('includeTax')?.value == 1)
            this.chkIncludeTax.nativeElement.checked = true;
          else
            this.chkIncludeTax.nativeElement.checked = false;

          this.tableMapper(this.model.get('lstPurchaseOrderDetail')?.value, this.table2);
          this.spinner.hide();
        } else
          this.errorHandler(response.message);
      },
      error: (err) => { this.exceptionHandler(err) }
    })
  }

  public delete() {
    let initialState = { tipo: 3, opcion: 1 };
    this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
    this.bsModalRef.content.response.subscribe((value: any) => {
      if (value === 'ok') {
        let object: any = { id: this.setting.recordId };

        this.spinner.show();
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

  public print() {
    let object: any = { id: this.setting.recordId };

    this.spinner.show();
    this.service.findById(object).subscribe({
      next: (response) => {
        if (response !== null && response.status == 'ok') {
          this.spinner.hide();

          var w = 1080;
          var h = 600;
          var left = (window.screen.width / 2) - (w / 2);
          var top = (window.screen.height / 2) - (h / 2) - 20;

          let purchaseOrder: PurchaseOrder = response.value;
          purchaseOrder.supplier.address = (purchaseOrder.supplier.address == '') ? '-' : purchaseOrder.supplier.address;
          purchaseOrder.supplier.phoneNumber = (purchaseOrder.supplier.phoneNumber == '') ? '-' : purchaseOrder.supplier.phoneNumber;
          purchaseOrder.supplier.email = (purchaseOrder.supplier.email == '') ? '-' : purchaseOrder.supplier.email;

          var mywindow: any = window.open("", "PRINT", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

          mywindow.document.write(`
          <html>
            <head>
              <title>ORDEN DE COMPRA</title>
              <link rel="stylesheet" href="../assets/css/bootstrap.min.css">
              <link rel="stylesheet" href="../assets/css/styles-print.css">
            </head>
            <body>
              <div class="container" style="font-family:verdana; font-size:10px; margin-top:60px;">

                <div class="row">

                  <div class="col-3">
                    <img src="../assets/images/`+ environment.company.logo + `.jpg" height="70" width="150" alt="Logotipo" style="margin-top: -10px;">
                  </div>

                  <div class="col-9 text-center">
                    <label style="font-weight: bold;"> `+ environment.company.reasonSocial + ` </label> <br/>
                    <label style="font-weight: bold;"> RUC: `+ environment.company.ruc + ` </label> <br/> <br/>
                    <label> Domicilio Fiscal: `+ environment.company.fiscalAddress + ` </label> <br/>
                    <label> Lugar de Entrega: `+ environment.company.deliveryPlace + ` </label> <br/>
                    <label> Email: `+ environment.company.email + ` </label> <br/>
                    <label> Telefono: `+ environment.company.phone + ` </label>
                  </div>

                </div>

                <div class="row">

                  <div class="col-12 text-center">
                    <br/>
                    <label style="font-size:11px; font-weight: bold;">ORDEN DE COMPRA</label> <br/>
                    <label style="font-size:11px; font-weight: bold;"> Nº de Orden `+ this.pad(purchaseOrder.id, 5, 0) + `</label>
                  </div>

                </div>

                <br/>

                <div class="row">

                  <div class="col-3">
                    <label> FECHA COMPRA :</label> <br/>
                    <label> PROVEEDOR :</label> <br/>
                    <label> RUC :</label> <br/>
                    <label> DOMICILIO: </label> <br/>
                    <label> TELEFONO: </label> <br/>
                    <label> EMAIL: </label> <br/>
                    <label> FECHA ENTREGA: </label> <br/>
                    <label> FORMA PAGO :</label> <br/>
                    <label> MONEDA :</label>
                  </div>

                  <div class="col-9">
                    <label> `+ purchaseOrder.purchaseDate + `</label> <br/>
                    <label> `+ purchaseOrder.supplier.reasonSocial + `</label> <br/>
                    <label> `+ purchaseOrder.supplier.ruc + `</label> <br/>
                    <label> `+ purchaseOrder.supplier.address + ` </label> <br/>
                    <label> `+ purchaseOrder.supplier.phoneNumber + ` </label>  <br/>
                    <label> `+ purchaseOrder.supplier.email + ` </label> <br/>
                    <label> `+ purchaseOrder.deliveryDate + `</label> <br/>
                    <label> `+ purchaseOrder.paymentMethod.name + `</label> <br/>
                    <label> `+ purchaseOrder.currency.shortName + `</label>
                  </div>

                </div>

                <br/>

                <table class="table table-bordered">
                  <thead>
                   <tr>
                      <th colspan="5" class="th-print text-center">DESCRIPCION DE LA ORDEN</th>
                    </tr>
                    <tr>
                      <th width="8%"  class="th-print text-center">Cantidad</th>
                      <th width="56%" class="th-print text-center">Producto</th>
                      <th width="12%" class="th-print text-center">U. MEDIDA</th>
                      <th width="12%" class="th-print text-center">Precio Unitario</th>
                      <th width="12%" class="th-print text-center">Importe Total</th>
                    </tr>
                  </thead>
                  <tbody>`
          );

          for (let i = 0; i < purchaseOrder.lstPurchaseOrderDetail.length; i++) {
            mywindow.document.write(' <tr>')
            mywindow.document.write('    <td class="td-print text-center">' + purchaseOrder.lstPurchaseOrderDetail[i].amount) + '</td>'
            mywindow.document.write('    <td class="td-print text-left">' + purchaseOrder.lstPurchaseOrderDetail[i].product.name + '</td>')
            mywindow.document.write('    <td class="td-print text-center">' + purchaseOrder.lstPurchaseOrderDetail[i].product.unitMeasure.name + '</td>')
            mywindow.document.write('    <td class="td-print text-end">' + purchaseOrder.lstPurchaseOrderDetail[i].unitPrice) + '</td>'
            mywindow.document.write('    <td class="td-print text-end">' + (purchaseOrder.lstPurchaseOrderDetail[i].amount * purchaseOrder.lstPurchaseOrderDetail[i].unitPrice).toFixed(2)) + '</td>'
            mywindow.document.write(' </tr>')
          }

          mywindow.document.write(`
                    <tr>
                      <td colspan="3"></td>
                      <td class="td-print text-left" style="font-weight: bold;">Sub Total</td>
                      <td class="td-print text-end" style="font-weight: bold;">` + purchaseOrder.saleValue.toFixed(2) + `</td>
                    </tr>
                    <tr>
                      <td colspan="3" rowspan="2"></td>

                      <td class="td-print text-left" style="font-weight: bold;">I.G.V(18%)</td>
                      <td class="td-print text-end" style="font-weight: bold;">` + purchaseOrder.saleTax.toFixed(2) + `</td>
                    </tr>
                    <tr>
                      <td class="td-print text-left" style="font-weight: bold;">TOTAL</td>
                      <td class="td-print text-end" style="font-weight: bold;" style="font-weight: bold;">` + purchaseOrder.salePrice.toFixed(2) + `</td>
                    </tr>
                  </tbody>
                </table>


                <div class="row" style="margin-top:50px;">

                  <div class="col-2 text-end">
                    <label> Autorizado por: </label> <br/>
                  </div>

                  <div class="col-3 text-center">
                    <hr>
                    <label class="td-print"> Firma y sello </label> <br/>
                  </div>

                  <div class="col-2 offset-2 text-end">
                    <label> Recibido por: </label> <br/>
                  </div>

                  <div class="col-3 text-center">
                    <hr>
                    <label class="td-print"> Firma y sello </label> <br/>
                  </div>

                </div>

                <hr>
                <p class="text-center" style="font-size:11px; font-weight: bold; font-style: oblique;">Nos reservamos el derecho de devolver la mercaderia que no este de acuerdo a nuestras especificaciones</p>
                <p class="text-center" style="font-size:11px; font-weight: bold; font-style: oblique;">Este no es un comprobante de pago</p>
              </div>
            </body>
          </html>`
          );

          setTimeout(function () {
            mywindow.document.close()
            mywindow.focus()
            mywindow.print()
            mywindow.close()
          }, 250)

        } else
          this.errorHandler(response.message);
      },
      error: (err) => { this.exceptionHandler(err) }
    })
  }

  public save() {
    if (this.model.valid) {
      let object: PurchaseOrder = Object.assign({}, this.model.value);
      object.id = object.id.toString() == '' ? 0 : object.id;
      object.observation = object.observation.toUpperCase();
      object.taxValue = this.setting.taxValue;

      let purchaseDate: any = object.purchaseDate;
      let deliveryDate: any = object.deliveryDate;

      if (purchaseDate instanceof Date) object.purchaseDate = moment(object.purchaseDate).format('DD/MM/YYYY');
      if (deliveryDate instanceof Date) object.deliveryDate = moment(object.deliveryDate).format('DD/MM/YYYY');

      let array: Array<PurchaseOrderDetail> = this.model.get('lstPurchaseOrderDetail')?.value;
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
              this.model.get('id')?.setValue(this.pad(response.value, 5, 0));

              let initialState: any = { tipo: 1, opcion: 1 };
              this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
              this.bsModalRef.content.response.subscribe(() => { this.exit(true) });
              this.spinner.hide();
            } else
              this.errorHandler(response.message);
          },
          error: (err) => { this.exceptionHandler(err) }
        })
      } else {
        this.spinner.show();
        this.service.update(object).subscribe({
          next: (response) => {
            if (response !== null && response.status == 'ok') {
              let initialState: any = { tipo: 1, opcion: 2 };
              this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
              this.bsModalRef.content.response.subscribe(() => { this.exit(true) });
              this.spinner.hide();
            } else
              this.errorHandler(response.message);
          },
          error: (err) => { this.exceptionHandler(err) }
        })
      }
    } else {
      this.model.markAllAsTouched();
      let initialState = { tipo: 3, opcion: 10 };
      this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
    }
  }

  public exit(updatedRecord?: boolean) {
    this.model.reset({
      id: '',
      idHeadquarters: 0,
      purchaseDate: moment().format('DD/MM/YYYY'),
      deliveryDate: moment().format('DD/MM/YYYY'),
      observation: '',
      creditDays: 0,
      includeTax: 0,
      totalItems: 0,
      taxValue: 0,
      exchangeRate: 0,
      saleValue: '0.00',
      salePrice: '0.00',
      saleTax: '0.00',
      proofPaymentType: { id: 1 },
      supplier: { id: '', ruc: '', reasonSocial: '' },
      authorizer: { id: '', name: '' },
      paymentMethod: { id: 1, name: '' },
      currency: { id: 1, name: '' },
      state: { id: 11, name: '', icon: '', color: '' }
    });
    this.model.get('lstPurchaseOrderDetail')?.setValue([]);

    this.setting.mainScreen = false;
    this.setting.onlyView = false;
    this.setting.recordId2 = 0;

    if (updatedRecord) {
      this.setting.recordId = 0;
      this.search();
    }
  }

  public searchSupplier() {
    this.bsModalRef = this.bsModalService.show(ModalSupplierComponent, { class: 'modal-lg modal-dialog-centered', backdrop: 'static' });
    this.bsModalRef.content.response.subscribe((response: Supplier) => {
      if (response != null) {
        let lstFilter = this.paged.get('lstFilter') as FormArray;

        lstFilter.controls[2].get('value')?.setValue(response.id);
        this.setting.filterSupplier = response.ruc + ' - ' + response.reasonSocial;
        this.search();
      }
    });
  }

  public searchAuthorizerReg() {
    this.bsModalRef = this.bsModalService.show(ModalAuthorizerComponent, { class: 'modal-lg modal-dialog-centered', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: Authorizer) => {
      if (response != null) {
        this.model.get('authorizer')?.get('id')?.setValue(response.id)
        this.model.get('authorizer')?.get('name')?.setValue(response.name)
      }
    });
  }

  public searchSupplierReg() {
    this.bsModalRef = this.bsModalService.show(ModalSupplierComponent, { class: 'modal-lg modal-dialog-centered', backdrop: 'static' });
    this.bsModalRef.content.response.subscribe((response: Supplier) => {
      if (response != null) {
        this.model.get('supplier')?.get('id')?.setValue(response.id);
        this.model.get('supplier')?.get('ruc')?.setValue(response.ruc);
        this.model.get('supplier')?.get('reasonSocial')?.setValue(response.reasonSocial);
      }
    });
  }

  public cleanSupplier() {
    let lstFilter = this.paged.get('lstFilter') as FormArray;

    lstFilter.controls[2].get('value')?.setValue('');
    this.setting.filterSupplier = '';
    this.search();
  }

  public cleanAuthorizerReg() {
    this.model.get('authorizer')?.get('id')?.setValue('');
    this.model.get('authorizer')?.get('name')?.setValue('');
  }

  public cleanSupplierReg() {
    this.model.get('supplier')?.get('id')?.setValue('');
    this.model.get('supplier')?.get('ruc')?.setValue('');
    this.model.get('supplier')?.get('reasonSocial')?.setValue('');
  }

  public cleanRangeDate() {
    let lstFilter = this.paged.get('lstFilter') as FormArray;

    if (lstFilter.controls[3].get('value')?.value != '') {
      lstFilter.controls[3].get('value')?.setValue('');
      this.setting.filterRangeDate = [];
      this.search();
    }
  }

  public addItem() {
    let array: Array<PurchaseOrderDetail> = this.model.get('lstPurchaseOrderDetail')?.value;
    let object: PurchaseOrderDetail = undefined!;
    let exist: PurchaseOrderDetail;

    let initialState = { object };
    this.bsModalRef = this.bsModalService.show(PurchaseOrderDetailComponent, { initialState, class: 'modal-xl-custom modal-dialog-custom', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: PurchaseOrderDetail) => {
      if (response != null) {
        exist = array.find(x => x.product.id == response.product.id)!;

        if (exist == undefined) {

          if (this.model.get('includeTax')?.value) {
            response.unitPrice = response.unitValue;
            response.unitValue = response.unitPrice / (1 + (this.setting.taxValue / 100));
            response.unitTax = response.unitValue * (this.setting.taxValue / 100);

          } else {
            response.unitValue = response.unitValue;
            response.unitTax = response.unitValue * (this.setting.taxValue / 100);
            response.unitPrice = response.unitValue + response.unitTax;
          }

          response.unitValue = Number(response.unitValue.toFixed(2));
          response.unitTax = Number(response.unitTax.toFixed(2));
          response.unitPrice = Number(response.unitPrice.toFixed(2));
          array.push(response);

          this.calculteTotals();
          this.tableMapper(this.model.get('lstPurchaseOrderDetail')?.value, this.table2);
        }
        else {
          let initialState = { tipo: 4, opcion: 6 }
          this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
        }
      }
    });
  }

  public editItem() {
    let array: Array<PurchaseOrderDetail> = this.model.get('lstPurchaseOrderDetail')?.value;
    let index: number = array.findIndex(x => x.product.id == this.setting.recordId2);
    let object: PurchaseOrderDetail = array[index];

    let initialState = { object };
    this.bsModalRef = this.bsModalService.show(PurchaseOrderDetailComponent, { initialState, class: 'modal-xl-custom modal-dialog-custom', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: PurchaseOrderDetail) => {
      if (response != null) {
        array[index].amount = response.amount;

        if (this.model.get('includeTax')?.value) {
          array[index].unitPrice = response.unitValue;
          array[index].unitValue = response.unitPrice / (1 + (this.setting.taxValue / 100));
          array[index].unitTax = response.unitValue * (this.setting.taxValue / 100);

        } else {
          array[index].unitValue = response.unitValue;
          array[index].unitTax = response.unitValue * (this.setting.taxValue / 100);
          array[index].unitPrice = response.unitValue + response.unitTax;
        }

        array[index].unitValue = Number(array[index].unitValue.toFixed(2));
        array[index].unitTax = Number(array[index].unitTax.toFixed(2));
        array[index].unitPrice = Number(array[index].unitPrice.toFixed(2));
        this.calculteTotals();
      };
    });
  }

  public removeItem() {
    let array: Array<PurchaseOrderDetail> = this.model.get('lstPurchaseOrderDetail')?.value;
    let index: number = array.findIndex(x => x.product.id == this.setting.recordId2);
    array.splice(index, 1);
    this.tableMapper(this.model.get('lstPurchaseOrderDetail')?.value, this.table2);

    this.setting.recordId2 = 0;
    this.calculteTotals();
  }

  private calculteTotals() {
    let saleValue: number = 0;
    let saleTax: number = 0;
    let salePrice: number = 0;

    let array: Array<PurchaseOrderDetail> = this.model.get('lstPurchaseOrderDetail')?.value;

    for (let item of array) {
      saleValue += item.unitValue * item.amount;
      saleTax += item.unitTax * item.amount;
      salePrice += item.unitPrice * item.amount;
    }

    salePrice = saleValue + saleTax;
    this.model.get('saleValue')?.setValue(Number(saleValue.toFixed(2)));
    this.model.get('saleTax')?.setValue(Number(saleTax.toFixed(2)));
    this.model.get('salePrice')?.setValue(Number(salePrice.toFixed(2)));
  }

  public selectRecord(record: any) {
    this.setting.recordId = record.id;
    this.setting.stateId = parseInt(record.state.id);

    if (this.setting.stateId == 11)
      this.setting.onlyView = false;
    else
      this.setting.onlyView = true;
  }

  public selectRecord2(record: any) {
    this.setting.recordId2 = record.product.id;
  }

  public onChangeInvalidDate(event: any) {
    let mensaje = event.target.value;

    if (mensaje == 'Invalid date') {
      event.target.value = 'fecha invalida'
    }
  }

  public onChangeRangeDate(value: any) {
    if (value != null) {
      let lstFilter = <FormArray>this.paged.get('lstFilter');
      let array: any[] = value;

      if (array.length > 0) {
        let range: String = moment(array[0]).format('DD/MM/YYYY') + '-' + moment(array[1]).format('DD/MM/YYYY');
        lstFilter.controls[3].get('value')?.setValue(range);
        this.search();
      }
    }
  }

  public onChangeCurrency() {
    let currency: Currency = this.getCurrency(this.model.get('currency')?.get('id')?.value);
    this.setting.currencyAcronym = currency.acronym;
  }

  public onChangeProofPaymentType() {
    let proofPaymentType: ProofPaymentType = this.getProofPaymentType(this.model.get('proofPaymentType')?.get('id')?.value);
    this.setting.taxValue = proofPaymentType.taxValue;

    let array: Array<PurchaseOrderDetail> = this.model.get('lstPurchaseOrderDetail')?.value;
    for (let item of array) {
      item.unitTax = item.unitValue * (this.setting.taxValue / 100);
      item.unitPrice = item.unitValue + item.unitTax;
    }

    this.calculteTotals();
  }

  private getCurrency(id: number) {
    let object: any;

    for (let indice in this.setting.lstCurrency) {
      if (id == this.setting.lstCurrency[indice].id) {
        object = this.setting.lstCurrency[indice];
        break;
      }
    }

    return object;
  }

  private getProofPaymentType(id: number) {
    let object: any;

    for (let indice in this.setting.lstProofPaymentType) {
      if (id == this.setting.lstProofPaymentType[indice].id) {
        object = this.setting.lstProofPaymentType[indice];
        break;
      }
    }

    return object;
  }

  public onKeyPressAlfaNumerico(event: any) {
    let pattern = /^[a-zA-Z0-9 ]+$/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  public onKeyPressDate(event: any) {
    let pattern = /^([0-9,/])*$/
    let inputChar = String.fromCharCode(event.charCode)

    if (!pattern.test(inputChar)) {
      event.preventDefault()
    }
  }

  public includeTax(event: any) {
    let { checked } = event.target;

    let array: Array<PurchaseOrderDetail> = this.model.get('lstPurchaseOrderDetail')?.value;

    if (checked) {
      this.model.get('includeTax')?.setValue(1);

      for (let item of array) {
        item.unitPrice = item.unitValue;
        item.unitValue = item.unitPrice / (1 + (this.setting.taxValue / 100));
        item.unitTax = item.unitValue * (this.setting.taxValue / 100);

        item.unitValue = Number(item.unitValue.toFixed(2));
        item.unitTax = Number(item.unitTax.toFixed(2));
        item.unitPrice = Number(item.unitPrice.toFixed(2));
      }

    } else {
      this.model.get('includeTax')?.setValue(0);
      for (let item of array) {
        item.unitValue = item.unitPrice;
        item.unitTax = item.unitValue * (this.setting.taxValue / 100);
        item.unitPrice = item.unitPrice + item.unitTax;

        item.unitValue = Number(item.unitValue.toFixed(2));
        item.unitTax = Number(item.unitTax.toFixed(2));
        item.unitPrice = Number(item.unitPrice.toFixed(2));
      }
    }

    this.calculteTotals();
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

    if (table.content.length > 0)
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

  private pad(n: any, width: number, z: any) {
    z = z || '0';
    n = n + '';

    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
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
