import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';

import { PageNumber, Table } from '../../shared/interfaces/table.interface';
import { Paged } from '../../shared/interfaces/paged.interface';
import { Page } from '../../shared/interfaces/page.interface';
import { ServiceOrderService } from './services/service-order.service';
import { ModalMessageComponent } from '../../shared/components/modal-message/modal-message.component';
import { ServiceOrder } from './interfaces/service-order.interface';
import { ServiceOrderDetail } from './interfaces/service-order-detail.interface';
import { ModalCostCenterComponent } from '../shared/components/modal-cost-center/modal-cost-center.component';
import { ModalAuthorizerComponent } from '../shared/components/modal-authorizer/modal-authorizer.component';
import { SettingServiceOrder } from './interfaces/setting-service-order.interface';
import { ModalSupplierComponent } from '../shared/components/modal-supplier/modal-supplier.component';
import { Supplier } from '../supplier/interfaces/supplier.interface';
import { ServiceOrderDetailComponent } from './components/service-order-detail/service-order-detail.component';
import { environment } from '../../../environments/environment';
import { ProofPaymentType } from '../shared/interfaces/proof-payment-type.interface';
import { Filter } from '../../shared/interfaces/filter.interface';
import { Currency } from '../shared/interfaces/currency.interface';
import { CostCenter } from '../cost-center/interfaces/cost-center.interface';
import { Authorizer } from '../authorizer/interfaces/authorizer.interface';

@Component({
  selector: 'app-service-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule, BsDatepickerModule, FormsModule],
  templateUrl: './service-order.component.html'
})
export class ServiceOrderComponent {
  @ViewChild('filterId') filterId!: ElementRef;

  public model: FormGroup;
  public paged: FormGroup;
  public setting: SettingServiceOrder;
  public table: Table;
  public table2: Table;

  constructor(
    private bsModalService: BsModalService,
    private bsModalRef: BsModalRef,
    private bsLocaleService: BsLocaleService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private service: ServiceOrderService
  ) {
    this.bsLocaleService.use('es');

    this.model = this.formBuilder.group({
      id: '',
      date: [moment().format('DD/MM/YYYY'), Validators.required],
      observation: '',
      creditDays: 0,
      taxValue: 0,
      saleValue: '0.00',
      salePrice: '0.00',
      saleTax: '0.00',
      proofPaymentType: this.formBuilder.group({ id: 1 }),
      supplier: this.formBuilder.group({ id: ['', [Validators.required]], ruc:'', reasonSocial: '' }),
      costCenter: this.formBuilder.group({ id: ['', [Validators.required]], name: '' }),
      authorizer: this.formBuilder.group({ id: ['', [Validators.required]], name: '' }),
      paymentMethod: this.formBuilder.group({ id: 1, name: '' }),
      currency: this.formBuilder.group({ id: 1, name: '' }),
      state: this.formBuilder.group({ id: 11, name: '', icon:'', color:'' }),
      lstServiceOrderDetail: Array<ServiceOrderDetail>
    });
    this.model.get('lstServiceOrderDetail')?.setValue([]);

    this.paged = this.formBuilder.group({
      pageSize: 10,
      pageNumber: 1,
      orderColumn: 'serviceOrder.date',
      order: 'ASC',
      lstFilter: this.formBuilder.array(
        [
          this.formBuilder.group({ object: 'serviceOrder', column: 'id', value: ['', Validators.pattern(/^[a-zA-Z0-9 ]+$/)], operator: 'equal' }),
          this.formBuilder.group({ object: 'proofPaymentType', column: 'id', value: '', operator: 'equal' }),
          this.formBuilder.group({ object: 'supplier', column: 'id', value: '', operator: 'equal' }),
          this.formBuilder.group({ object: 'serviceOrder', column: 'date', value: '', operator: 'rangeDate' }),
          this.formBuilder.group({ object: 'state', column: 'id', value: '', operator: 'equal' })
        ]
      )
    });

    this.setting = {
      recordId: 0,
      recordId2: 0,
      operation: '',
      onlyView: true,
      mainScreen: false,
      currencyAcronym: '',
      taxValue : 0,
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
      endElement : 0,
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
      lstPageNumber:[
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
      endElement : 0,
      content: [],
      lstColumn: [
        { name: 'N°', width: '5%', style: 'text-center' },
        { name: 'CÓDIGO', width: '8%', style: 'text-center' },
        { name: 'PRODUCTO', width: '37%', style: 'text-start' },
        { name: 'UND. MEDIDA', width: '10%', style: 'text-start' },
        { name: 'CANTIDAD', width: '8%', style: 'text-end' },
        { name: 'VALOR UNT.', width: '8%', style: 'text-end' },
        { name: 'SUB TOTAL', width: '8%', style: 'text-end' },
        { name: 'IMPUESTO', width: '8%', style: 'text-end' },
        { name: 'TOTAL', width: '8%', style: 'text-end' }
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
    this.setting.mainScreen = true;
    this.setting.operation = 'NUEVO';
    this.setting.onlyView = false;
    this.tableMapper(this.model.get('lstServiceOrderDetail')?.value, this.table2);
  }

  public update() {
    this.setting.mainScreen = true;
    this.setting.operation = 'MODIFICAR';
    this.setting.onlyView = false;

    let object: any = { id: this.setting.recordId };

    this.spinner.show();
    this.service.findById(object).subscribe({
      next: (response) => {
        if (response !== null && response.status == 'ok') {
          this.model.patchValue(response.value);
          this.model.get('id')?.setValue(this.pad(this.model.get('id')?.value, 5, 0));
          this.tableMapper(this.model.get('lstServiceOrderDetail')?.value, this.table2);
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

          let serviceOrder: ServiceOrder = response.value;
          serviceOrder.supplier.address = (serviceOrder.supplier.address == '') ? '-' : serviceOrder.supplier.address;
          serviceOrder.supplier.phoneNumber = (serviceOrder.supplier.phoneNumber == '') ? '-' : serviceOrder.supplier.phoneNumber;
          serviceOrder.supplier.email = (serviceOrder.supplier.email == '') ? '-' : serviceOrder.supplier.email;

          var mywindow: any = window.open("", "PRINT", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

          mywindow.document.write(`
          <html>
            <head>
              <title>ORDEN DE COMPRA</title>
              <link rel="stylesheet" href="../assets/css/bootstrap.min.css">
              <link rel="stylesheet" href="../assets/css/styles-print.css">
            </head>
            <body>
              <div class="container" style="font-family:verdana; font-size:10px;">

                <div class="row">

                  <div class="col-3">
                    <img src="../assets/images/`+ environment.company.logo + `.jpg" height="100" width="150" alt="Logotipo" style="margin-top: -10px;">
                  </div>

                  <div class="col-9 text-center" >
                    <label style="font-weight: bold;"> `+ environment.company.reasonSocial + ` </label> <br/>
                    <label style="font-weight: bold;"> RUC: `+ environment.company.ruc + ` </label> <br/> <br/>
                    <label> DOMICILIO FISCAL: `+ environment.company.fiscalAddress + ` </label> <br/>
                    <label> LUGAR DE ENTREGA: `+ environment.company.deliveryPlace + ` </label> <br/>
                    <label> Email: `+ environment.company.email + ` </label> <br/>
                    <label> Telefono: `+ environment.company.phone + ` </label>
                  </div>

                </div>

                <div class="row">

                  <div class="col-12 text-center">
                    <br/>
                    <label style="font-size:11px; font-weight: bold;">ORDEN DE COMPRA</label> <br/>
                    <label style="font-size:11px; font-weight: bold;"> Nº de Orden `+ serviceOrder.id + `</label>
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
                    <label> `+ serviceOrder.date + `</label> <br/>
                    <label> `+ serviceOrder.supplier.reasonSocial + `</label> <br/>
                    <label> `+ serviceOrder.supplier.ruc + `</label> <br/>
                    <label> `+ serviceOrder.supplier.address + ` </label> <br/>
                    <label> `+ serviceOrder.supplier.phoneNumber + ` </label>  <br/>
                    <label> `+ serviceOrder.supplier.email + ` </label> <br/>
                    <label> `+ serviceOrder.date + `</label> <br/>
                    <label> `+ serviceOrder.paymentMethod.name + `</label> <br/>
                    <label> `+ serviceOrder.currency.shortName + `</label>
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


          for (let i = 0; i < serviceOrder.lstServiceOrderDetail.length; i++) {
            mywindow.document.write(' <tr>')
            mywindow.document.write('    <td class="td-print text-center">' + serviceOrder.lstServiceOrderDetail[i].amount) + '</td>'
            mywindow.document.write('    <td class="td-print text-left">' + serviceOrder.lstServiceOrderDetail[i].product.name + '</td>')
            mywindow.document.write('    <td class="td-print text-center">' + serviceOrder.lstServiceOrderDetail[i].product.unitMeasure.name + '</td>')
            mywindow.document.write('    <td class="td-print text-end">' + serviceOrder.lstServiceOrderDetail[i].unitPrice) + '</td>'
            mywindow.document.write('    <td class="td-print text-end">' + (serviceOrder.lstServiceOrderDetail[i].amount * serviceOrder.lstServiceOrderDetail[i].unitPrice).toFixed(2)) + '</td>'
            mywindow.document.write(' </tr>')
          }

          mywindow.document.write(`
                    <tr>
                      <td colspan="3"></td>
                      <td class="td-print text-left" style="font-weight: bold;">Sub Total</td>
                      <td class="td-print text-end" style="font-weight: bold;">` + serviceOrder.saleValue .toFixed(2) + `</td>
                    </tr>
                    <tr>
                      <td colspan="3" rowspan="2"></td>

                      <td class="td-print text-left" style="font-weight: bold;">I.G.V(18%)</td>
                      <td class="td-print text-end" style="font-weight: bold;">` + serviceOrder.saleTax.toFixed(2) + `</td>
                    </tr>
                    <tr>
                      <td class="td-print text-left" style="font-weight: bold;">TOTAL</td>
                      <td class="td-print text-end" style="font-weight: bold;" style="font-weight: bold;">` + serviceOrder.salePrice.toFixed(2) + `</td>
                    </tr>
                  </tbody>
                </table>

                <br>
                <div class="row">

                  <div class="col-1">

                  </div>

                  <div class="col-3">
                    <img src="../assets/images/`+ environment.company.signature + `.jpg" height="100" width="150" alt="Logotipo" style="margin-top: -10px;">
                  </div>

                </div>

                <div class="row">

                  <div class="col-1">
                    <label> Autorizó: </label> <br/>
                  </div>

                  <div class="col-3 text-center">
                    <hr>
                    <label class="td-print "> Firma y sello </label> <br/>
                  </div>

                  <div class="col-2 offset-3 text-end">
                    <label> Recibido por: </label> <br/>
                  </div>

                  <div class="col-3 text-center">
                    <hr>
                    <label class="td-print "> Firma y sello del proveedor </label> <br/>
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

  public view() {
    this.update();
    this.setting.operation = 'VISUALIZAR';
    this.setting.onlyView = true;
  }

  public save() {
    if (this.model.valid) {
      let object: ServiceOrder = Object.assign({}, this.model.value);
      object.id = object.id.toString() == '' ? 0 : object.id;
      object.observation = object.observation.toUpperCase();
      object.taxValue = this.setting.taxValue;

      let date: any = object.date;

      if (date instanceof Date) object.date = moment(object.date).format('DD/MM/YYYY');

      let array: Array<ServiceOrderDetail> = this.model.get('lstServiceOrderDetail')?.value;
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
      date: moment().format('DD/MM/YYYY'),
      observation: '',
      creditDays: 0,
      taxValue: 0,
      saleValue: '0.00',
      salePrice: '0.00',
      saleTax: '0.00',
      proofPaymentType: { id: 1 },
      supplier: { id: '', ruc:'', reasonSocial: '' },
      costCenter: { id: '', name: '' },
      authorizer: { id: '', name: '' },
      paymentMethod: { id: 1, name: '' },
      currency: { id: 1, name: '' },
      state: { id: 11, name: '', icon:'', color:'' }
    });
    this.model.get('lstServiceOrderDetail')?.setValue([]);

    this.setting.onlyView = true;
    this.setting.mainScreen = false;

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

  public searchCostCenterReg() {
    let lstFilter: Filter[] =  [
      { object: 'costCenterType', column: 'id', value: '1', operator: 'equal' }
    ];
    let initialState = { lstFilter : lstFilter };

    this.bsModalRef = this.bsModalService.show(ModalCostCenterComponent, { initialState, class: 'modal-lg modal-dialog-centered', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: CostCenter) => {
      if (response != null) {
        this.model.get('costCenter')?.get('id')?.setValue(response.id);
        this.model.get('costCenter')?.get('name')?.setValue(response.name);
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

  public cleanCostCenterReg() {
    this.model.get('costCenter')?.get('id')?.setValue('');
    this.model.get('costCenter')?.get('name')?.setValue('');
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
    let array: Array<ServiceOrderDetail> = this.model.get('lstServiceOrderDetail')?.value;
    let object: ServiceOrderDetail = undefined!;
    let exist: ServiceOrderDetail;

    let initialState = { object };
    this.bsModalRef = this.bsModalService.show(ServiceOrderDetailComponent, { initialState, backdrop: 'static', class: 'modal-xl modal-dialog-custom' })
    this.bsModalRef.content.response.subscribe((response: ServiceOrderDetail) => {
      if (response != null) {
        exist = array.find(x => x.product.id == response.product.id)!;

        if (exist == undefined) {
          response.unitTax = response.unitValue * (this.setting.taxValue / 100);
          response.unitPrice = response.unitValue + response.unitTax;
          array.push(response);
          this.calculteTotals();
          this.tableMapper(this.model.get('lstServiceOrderDetail')?.value, this.table2);
        }
        else {
          let initialState = { tipo: 4, opcion: 6 }
          this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
        }
      }
    });
  }

  public editItem() {
    let array: Array<ServiceOrderDetail> = this.model.get('lstServiceOrderDetail')?.value;
    let index: number = array.findIndex(x => x.product.id == this.setting.recordId2);
    let object: ServiceOrderDetail = array[index];

    let initialState = { object };
    this.bsModalRef = this.bsModalService.show(ServiceOrderDetailComponent, { initialState, backdrop: 'static', class: 'modal-xl modal-dialog-custom' })
    this.bsModalRef.content.response.subscribe((response: ServiceOrderDetail) => {
      if (response != null) {
        array[index].amount = response.amount;
        array[index].unitValue = response.unitValue;
        array[index].unitTax = array[index].unitValue * (this.setting.taxValue / 100);
        array[index].unitPrice = array[index].unitValue + array[index].unitTax;
        this.calculteTotals();
      };
    });
  }

  public removeItem() {
    let array: Array<ServiceOrderDetail> = this.model.get('lstServiceOrderDetail')?.value;
    let index: number = array.findIndex(x => x.product.id == this.setting.recordId2);
    array.splice(index, 1);
    this.tableMapper(this.model.get('lstServiceOrderDetail')?.value, this.table2);

    this.setting.recordId2 = 0;
    this.calculteTotals();
  }

  private calculteTotals() {
    let saleValue: number = 0;
    let saleTax: number = 0;
    let salePrice: number = 0;

    let array: Array<ServiceOrderDetail> = this.model.get('lstServiceOrderDetail')?.value;

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
    this.setting.stateId = record.state.id;

    if (this.setting.stateId == 11)
      this.setting.onlyView = false;
    else
      this.setting.onlyView = true;
  }

  public selectRecord2(record: any) {
    this.setting.recordId2 = record.item.id;
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

    let array: Array<ServiceOrderDetail> = this.model.get('lstServiceOrderDetail')?.value;
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
