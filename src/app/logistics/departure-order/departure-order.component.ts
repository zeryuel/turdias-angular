import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';

import { DepartureOrderService } from './services/departure-order.service';
import { ModalMessageComponent } from '../../shared/components/modal-message/modal-message.component';
import { DepartureOrder } from './interfaces/departure-order.interface';
import { ModalCostCenterComponent } from '../shared/components/modal-cost-center/modal-cost-center.component';
import { SettingDepartureOrder } from './interfaces/setting-departure-order.interface';
import { PageNumber, Table } from '../../shared/interfaces/table.interface';
import { DepartureOrderDetail } from './interfaces/departure-order-detail.interface';
import { Paged } from '../../shared/interfaces/paged.interface';
import { Page } from '../../shared/interfaces/page.interface';
import { Filter } from '../../shared/interfaces/filter.interface';
import { CostCenter } from '../cost-center/interfaces/cost-center.interface';
import { DepartureOrderDetailComponent } from './components/departure-order-detail/departure-order-detail.component';
import { environment } from '../../../environments/environment';
import { ModalPersonalComponent } from '../../scale/shared/components/modal-personal/modal-personal.component';
import { ModalAuthorizerComponent } from '../shared/components/modal-authorizer/modal-authorizer.component';
import { Personal } from '../../scale/personal/interfaces/personal.interface';
import { Authorizer } from '../authorizer/interfaces/authorizer.interface';
import { ModalProductComponent } from '../shared/components/modal-product/modal-product.component';
import { Product } from '../product/interfaces/product.interface';

@Component({
  selector: 'app-departure-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule, BsDatepickerModule, FormsModule],
  templateUrl: './departure-order.component.html'
})
export class DepartureOrderComponent {
  @ViewChild('filterId') filterId!: ElementRef;

  public model: FormGroup;
  public paged: FormGroup;
  public setting: SettingDepartureOrder;
  public table: Table;
  public table2: Table;

  constructor(
    private bsModalService: BsModalService,
    private bsModalRef: BsModalRef,
    private bsLocaleService: BsLocaleService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private service: DepartureOrderService
  ) {
    this.bsLocaleService.use('es');

    this.model = this.formBuilder.group({
      id: '',
      idEntryOrder: '',
      idWorkOrder: '',
      date: [moment().format('DD/MM/YYYY'), Validators.required],
      observation: '',
      proofPaymentType: this.formBuilder.group({ id: 0 }),
      operationType: this.formBuilder.group({ id: 10 }),
      originCostCenter: this.formBuilder.group({ id: ['', [Validators.required]], name: '' }),
      destinyCostCenter: this.formBuilder.group({ id: ['', [Validators.required]], name: '' }),
      personal: this.formBuilder.group({ id: ['', [Validators.required]], fullName: '', documentNumber: '' }),
      authorizer: this.formBuilder.group({ id: ['', [Validators.required]], name: '' }),
      state: this.formBuilder.group({ id: 41, name: '', icon:'', color:'' }),
      lstDepartureOrderDetail: Array<DepartureOrderDetail>
    });
    this.model.get('lstDepartureOrderDetail')?.setValue([]);

    this.paged = this.formBuilder.group({
      pageSize: 10,
      pageNumber: 1,
      orderColumn: 'departureOrder.id',
      order: 'DESC',
      lstFilter: this.formBuilder.array(
        [
          this.formBuilder.group({ object: 'departureOrder', column: 'id', value: ['', Validators.pattern(/^[a-zA-Z0-9 ]+$/)], operator: 'equal' }),
          this.formBuilder.group({ object: 'operationType', column: 'id', value: '', operator: 'equal' }),
          this.formBuilder.group({ object: 'destinyCostCenter', column: 'id', value: '', operator: 'equal' }),
          this.formBuilder.group({ object: 'departureOrderDetail', column: 'id_item', value: '', operator: 'equal' }),
          this.formBuilder.group({ object: 'departureOrder', column: 'date', value: '', operator: 'rangeDate' }),
          this.formBuilder.group({ object: 'state', column: 'id', value: '41', operator: 'equal' })
        ]
      )
    });

    this.setting = {
      recordId: 0,
      recordId2: 0,
      operation: '',
      onlyView: true,
      mainScreen: false,
      stateId: 0,
      filterCostCenter: '',
      filterItem: '',
      filterRangeDate: [],
      lstProofPaymentType: [],
      lstOperationType: [],
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
        { name: 'TIPO OPERACIÓN', width: '8%', style: 'text-center' },
        { name: 'DESTINO', width: '30%', style: 'text-start' },
        { name: 'FECHA SALIDA', width: '8%', style: 'text-center' },
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
        { name: 'N°', width: '4%', style: 'text-center' },
        { name: 'CÓDIGO', width: '8%', style: 'text-center' },
        { name: 'CÓD. ALTER.', width: '8%', style: 'text-center' },
        { name: 'PRODUCTO', width: '52%', style: 'text-start' },
        { name: 'MARCA', width: '10%', style: 'text-start' },
        { name: 'UND. MEDIDA', width: '8%', style: 'text-start' },
        { name: 'CANTIDAD RETIRAR', width: '10%', style: 'text-end' }
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
    this.spinner.show()
    this.service.setting(object).subscribe({
      next: (response) => {
        if (response !== null && response.status == 'ok') {
          this.paginationMapper(response.value.page.value, this.table);
          this.setting.lstProofPaymentType = response.value.lstProofPaymentType.value;
          this.setting.lstOperationType = response.value.lstOperationType.value;
          this.setting.lstState = response.value.lstState.value;

          this.filterId.nativeElement.focus();
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
      this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
    }
  }

  public create() {
    this.setting.mainScreen = true;
    this.setting.operation = 'NUEVO';
    this.setting.onlyView = false;
    this.tableMapper(this.model.get('lstDepartureOrderDetail')?.value, this.table2);
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
          this.model.get('id')?.setValue(this.pad(this.model.get('id')?.value, 5, 0));
          this.model.get('idEntryOrder')?.setValue(this.model.get('idEntryOrder')?.value == 0 ? '' : this.model.get('idEntryOrder')?.value);
          this.model.get('idWorkOrder')?.setValue(this.model.get('idWorkOrder')?.value == 0 ? '' : this.model.get('idWorkOrder')?.value);
          this.tableMapper(this.model.get('lstDepartureOrderDetail')?.value, this.table2);
          this.spinner.hide();
        } else
          this.errorHandler(response.message);
      },
      error: (err) => { this.exceptionHandler(err) }
    })
  }

  public delete() {
    let initialState = { tipo: 3, opcion: 2 };
    this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
    this.bsModalRef.content.response.subscribe((value: any) => {
      if (value == 'ok') {
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

  public print() {
    let object: any = { id: this.setting.recordId };

    this.spinner.show()
    this.service.findById(object).subscribe({
      next: (response) => {
        if (response !== null && response.status == 'ok') {
          this.spinner.hide();

          var w = 1080;
          var h = 600;
          var left = (window.screen.width / 2) - (w / 2);
          var top = (window.screen.height / 2) - (h / 2) - 20;

          let departureOrder: DepartureOrder = response.value;

          var mywindow: any = window.open("", "PRINT", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

          mywindow.document.write(`
          <html>
            <head>
              <title>ORDEN DE SALIDA</title>
              <link rel="stylesheet" href="../assets/css/bootstrap.min.css">
              <link rel="stylesheet" href="../assets/css/styles-print.css">
            </head>
            <body>
              <div class="container" style="font-family:verdana; font-size:10px; margin-top:60px;">

                <div class="row">

                  <div class="col-3">
                    <img src="../assets/images/`+ environment.company.logo + `.jpg" height="70" width="150" alt="Logotipo" style="margin-top: -10px;">
                  </div>

                  <div class="col-9 text-center" >
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
                    <label style="font-size:11px; font-weight: bold;">ORDEN DE SALIDA</label> <br/>
                    <label style="font-size:11px; font-weight: bold;"> Nº de Orden `+ this.pad(departureOrder.id, 5, 0) + `</label>
                  </div>

                </div>

                <br/>

                <div class="row">

                  <div class="col-2">
                    <label> ORIGEN :</label> <br/>
                    <label> DESTINO :</label> <br/>
                    <label> FECHA SALIDA :</label> <br/>
                  </div>

                  <div class="col-9">
                    <label> `+ departureOrder.originCostCenter.name + `</label> <br/>
                    <label> `+ departureOrder.destinyCostCenter.name + `</label> <br/>
                    <label> `+ departureOrder.date + `</label> <br/>
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
                      <th width="8%" class="th-print text-center">Codigo</th>
                      <th width="60%" class="th-print text-left">Descripcion</th>
                      <th width="12%" class="th-print text-center">Marca</th>
                      <th width="12%" class="th-print text-center">Cod. Altern.</th>
                    </tr>
                  </thead>
                  <tbody>`
          );

          for (let i = 0; i < departureOrder.lstDepartureOrderDetail.length; i++) {
            mywindow.document.write(' <tr>')
            mywindow.document.write('    <td class="td-print text-center">' + departureOrder.lstDepartureOrderDetail[i].amount) + '</td>'
            mywindow.document.write('    <td class="td-print text-end">' + departureOrder.lstDepartureOrderDetail[i].product.id) + '</td>'
            mywindow.document.write('    <td class="td-print text-left">' + departureOrder.lstDepartureOrderDetail[i].product.name + '</td>')
            mywindow.document.write('    <td class="td-print text-center">' + departureOrder.lstDepartureOrderDetail[i].product.brand.name + '</td>')
            mywindow.document.write('    <td class="td-print text-end">' + departureOrder.lstDepartureOrderDetail[i].product.alternativeCode) + '</td>'
            mywindow.document.write(' </tr>')
          }

          mywindow.document.write(`
                  </tbody>
                </table>

                <hr style="margin-top:15px;"/>

                <div class="row">
                 <div class="col-12">
                    <label>OBSERVACIONES:</label>
                    <label> `+ departureOrder.observation + `</label>
                 </div>
                </div>

                <div class="row" style="margin-top:50px;">
                  <div class="offset-1 col-4 text-center">
                    <hr style="color: #1C1B17;"/>
                    <label> AUTORIZADOR:</label> <br/>
                    <label> `+ departureOrder.authorizer.name + `</label>
                  </div>

                  <div class="offset-1 col-4 text-center">
                    <hr style="color: #1C1B17;"/>
                    <label> PERSONAL DE ENTREGA:</label> <br/>
                    <label> `+ departureOrder.personal.fullName + `</label>
                  </div>

                </div>

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
      let object: DepartureOrder = Object.assign({}, this.model.value);
      object.id = object.id.toString() == '' ? 0 : object.id;
      object.observation = object.observation.toUpperCase();

      let date: any = object.date;
      if (date instanceof Date) object.date = moment(object.date).format('DD/MM/YYYY');

      let array: Array<DepartureOrderDetail> = this.model.get('lstDepartureOrderDetail')?.value;
      if (array.length == 0) {
        let initialState = { tipo: 3, opcion: 12 }
        this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
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
      idEntryOrder: '',
      idWorkOrder: '',
      date: moment().format('DD/MM/YYYY'),
      observation: '',
      proofPaymentType: { id: 1 },
      operationType: { id: 10 },
      originCostCenter: { id: '', name: '' },
      destinyCostCenter: { id: '', name: '' },
      personal: { id: '', name: '' },
      authorizer: { id: '', name: '' },
      state: { id: 41, name: '', icon: '', color: '' }
    });
    this.model.get('lstDepartureOrderDetail')?.setValue([]);

    if (this.setting.stateId == 41)
      this.setting.onlyView = false;
    else
      this.setting.onlyView = true;

    this.setting.recordId2 = 0;
    this.setting.mainScreen = false;

    if (updatedRecord) {
      this.setting.recordId = 0;
      this.setting.stateId = 0;
      this.setting.onlyView = true;
      this.search();
    }
  }

  public searchWorkOrder() {

  }

  public searchAuthorizer() {
    this.bsModalRef = this.bsModalService.show(ModalAuthorizerComponent, { class: 'modal-lg modal-dialog-centered', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: Authorizer) => {
      if (response != null) {
        this.model.get('authorizer')?.get('id')?.setValue(response.id)
        this.model.get('authorizer')?.get('name')?.setValue(response.name)
      }
    });
  }

  public searchPersonal() {
    this.bsModalRef = this.bsModalService.show(ModalPersonalComponent, { class: 'modal-lg modal-dialog-centered', backdrop: 'static'})
    this.bsModalRef.content.response.subscribe((response: Personal) => {
      if (response != null) {
        this.model.get('personal')?.get('id')?.setValue(response.id);
        this.model.get('personal')?.get('fullName')?.setValue(response.fullName);
      }
    })
  }

  public searchCostCenter() {
    this.bsModalRef = this.bsModalService.show(ModalCostCenterComponent, { class: 'modal-lg modal-dialog-centered', backdrop: 'static'})
    this.bsModalRef.content.response.subscribe((response: CostCenter) => {
      if (response != null) {
        let lstFilter = this.paged.get('lstFilter') as FormArray;

        lstFilter.controls[2].get('value')?.setValue(response.id);
        this.setting.filterCostCenter = response.name;
        this.search();
      }
    })
  }

  public searchItem() {
    let lstFilter: Filter[] =  [
      { object: 'itemType', column: 'id', value: '1', operator: 'equal' }
    ];
    let initialState = { lstFilter : lstFilter };

    this.bsModalRef = this.bsModalService.show(ModalProductComponent, { initialState, class: 'modal-xl-custom modal-dialog-centered', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: Product) => {
      if (response != null) {
        let lstFilter = this.paged.get('lstFilter') as FormArray;

        lstFilter.controls[3].get('value')?.setValue(response.id);
        this.setting.filterItem = response.id + ' - ' + response.name;
        this.search();
      }
    });
  }

  public searchOriginCostCenter() {
    let lstFilter: Filter[] =  [
      { object: 'costCenterType', column: 'id', value: '1', operator: 'equal' }
    ];
    let initialState = { lstFilter : lstFilter };

    this.bsModalRef = this.bsModalService.show(ModalCostCenterComponent, { initialState, class: 'modal-lg modal-dialog-centered', backdrop: 'static'})
    this.bsModalRef.content.response.subscribe((response: CostCenter) => {
      if (response != null) {
        this.cleanOriginCostCenter();

        this.model.get('originCostCenter')?.get('id')?.setValue(response.id);
        this.model.get('originCostCenter')?.get('name')?.setValue(response.name);
      }
    })
  }

  public searchDestinyCostCenter() {
    let lstFilter: Filter[] =  [
      { object: 'costCenterType', column: 'id', value: '2, 3', operator: 'in' }
    ];
    let initialState = { lstFilter : lstFilter };

    this.bsModalRef = this.bsModalService.show(ModalCostCenterComponent, { initialState, class: 'modal-lg modal-dialog-centered', backdrop: 'static'})
    this.bsModalRef.content.response.subscribe((response: CostCenter) => {
      if (response != null) {
        this.model.get('destinyCostCenter')?.get('id')?.setValue(response.id);
        this.model.get('destinyCostCenter')?.get('name')?.setValue(response.name);
      }
    })
  }

  public cleanAuthorizer() {
    this.model.get('authorizer')?.get('id')?.setValue('');
    this.model.get('authorizer')?.get('name')?.setValue('');
  }

  public cleanWorkOrder() {

  }

  public cleanItem() {
    let lstFilter = this.paged.get('lstFilter') as FormArray;

    lstFilter.controls[3].get('value')?.setValue('');
    this.setting.filterItem = '';
    this.search();
  }

  public cleanCostCenter() {
    let lstFilter = this.paged.get('lstFilter') as FormArray;

    lstFilter.controls[2].get('value')?.setValue('');
    this.setting.filterCostCenter = '';
    this.search();
  }

  public cleanOriginCostCenter() {
    this.model.get('originCostCenter')?.get('id')?.setValue('');
    this.model.get('originCostCenter')?.get('name')?.setValue('');

    this.model.get('lstDepartureOrderDetail')?.setValue([]);
    this.tableMapper(this.model.get('lstDepartureOrderDetail')?.value, this.table2);
  }

  public cleanDestinyCostCenter() {
    this.model.get('destinyCostCenter')?.get('id')?.setValue('');
    this.model.get('destinyCostCenter')?.get('name')?.setValue('');
  }

  public cleanPersonal() {
    this.model.get('personal')?.get('id')?.setValue('');
    this.model.get('personal')?.get('fullName')?.setValue('');
  }

  public cleanRangeDate() {
    let lstFilter = this.paged.get('lstFilter') as FormArray;

    if (lstFilter.controls[4].get('value')?.value != '') {
      lstFilter.controls[4].get('value')?.setValue('');
      this.setting.filterRangeDate = [];
      this.search();
    }
  }

  public addItem() {
    if (this.model.valid) {

      let array: Array<DepartureOrderDetail> = this.model.get('lstDepartureOrderDetail')?.value;
      let exist: DepartureOrderDetail;
      let object: DepartureOrderDetail = undefined!;

      let almacen: CostCenter = {
        id: this.model.get('originCostCenter')?.get('id')?.value,
        idDocument: 0,
        name: this.model.get('originCostCenter')?.get('name')?.value,
        active: 0,
        costCenterType: { id: 0, name: '', active: 0 }
      };

      let initialState = { object: object, almacen: almacen };
      this.bsModalRef = this.bsModalService.show(DepartureOrderDetailComponent, { initialState, class: 'modal-xl-custom modal-dialog-custom', backdrop: 'static' })
      this.bsModalRef.content.response.subscribe((response: DepartureOrderDetail) => {
        if (response != null) {
          exist = array.find(x => x.product.id == response.product.id)!;

          if (exist == undefined) {
            array.push(response);
            this.tableMapper(this.model.get('lstDepartureOrderDetail')?.value, this.table2);
          }
          else {
            let initialState = { tipo: 4, opcion: 6 }
            this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
          }
        }
      });

    } else {
      this.model.markAllAsTouched()
      let initialState = { tipo: 3, opcion: 10 }
      this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
    }
  }

  public editItem() {
    let array: Array<DepartureOrderDetail> = this.model.get('lstDepartureOrderDetail')?.value;
    let index: number = array.findIndex(x => x.product.id == this.setting.recordId2);
    let object: DepartureOrderDetail = array[index];
    let almacen: CostCenter = {
      id: this.model.get('originCostCenter')?.get('id')?.value,
      idDocument: 0,
      name: this.model.get('originCostCenter')?.get('name')?.value,
      active: 0,
      costCenterType: { id: 0, name: '', active: 0 }
    };

    let initialState = { object: object, almacen: almacen };
    this.bsModalRef = this.bsModalService.show(DepartureOrderDetailComponent, { initialState, class: 'modal-xl-custom modal-dialog-custom', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: DepartureOrderDetail) => {
      if (response != null) {
        array[index].amount = response.amount;
        array[index].unitValue = response.unitValue;
      };
    });
  }

  public removeItem() {
    let array: Array<DepartureOrderDetail> = this.model.get('lstDepartureOrderDetail')?.value;
    let index: number = array.findIndex(x => x.product.id == this.setting.recordId2);
    array.splice(index, 1);
    this.tableMapper(this.model.get('lstDepartureOrderDetail')?.value, this.table2);

    this.setting.recordId2 = 0;
  }

  public selectRecord(record: any) {
    this.setting.recordId = record.id;
    this.setting.stateId = record.state.id;

    if (this.setting.stateId == 41)
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
        lstFilter.controls[4].get('value')?.setValue(range);
        this.search();
      }
    }
  }

  public onKeyPressNumeros(event: any) {
    let pattern = /^([0-9])*$/
    let inputChar = String.fromCharCode(event.charCode)

    if (!pattern.test(inputChar)) {
      event.preventDefault()
    }
  }

  public onKeyPressDecimales(event: any) {
    const pattern = /[0-9.]/
    const inputChar = String.fromCharCode(event.charCode)

    if (!pattern.test(inputChar)) {
      event.preventDefault()
    }
  }

  public onKeyPressAlfaNumerico(event: any) {
    let pattern = /^[a-zA-Z0-9 ]+$/
    let inputChar = String.fromCharCode(event.charCode)

    if (!pattern.test(inputChar)) {
      event.preventDefault()
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
