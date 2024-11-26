import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';

import { EntryOrderService } from './services/entry-order.service';
import { PurchaseOrderService } from '../purchase-order/services/purchase-order.service';
import { ModalMessageComponent } from '../../shared/components/modal-message/modal-message.component';
import { EntryOrder } from './interfaces/entry-order.interface';
import { PurchaseOrder } from '../purchase-order/interfaces/purchase-order.interface';
import { EntryOrderDetailComponent } from './components/entry-order-detail/entry-order-detail.component';
import { SettingEntryOrder } from './interfaces/setting-entry-order.interface';
import { PageNumber, Table } from '../../shared/interfaces/table.interface';
import { Paged } from '../../shared/interfaces/paged.interface';
import { Page } from '../../shared/interfaces/page.interface';
import { EntryOrderDetail } from './interfaces/entry-order-detail.interface';
import { Filter } from '../../shared/interfaces/filter.interface';
import { ModalPurchaseOrderComponent } from '../shared/components/modal-purchase-order/modal-purchase-order.component';
import { PurchaseOrderDetail } from '../purchase-order/interfaces/purchase-order-detail.interface';
import { CostCenter } from '../cost-center/interfaces/cost-center.interface';
import { environment } from '../../../environments/environment';
import { ModalProductComponent } from '../shared/components/modal-product/modal-product.component';
import { Product } from '../product/interfaces/product.interface';

@Component({
  selector: 'app-entry-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule, BsDatepickerModule, FormsModule],
  templateUrl: './entry-order.component.html'
})
export class EntryOrderComponent {
  @ViewChild('filterId') filterId!: ElementRef;

  public model: FormGroup;
  public paged: FormGroup;
  public setting: SettingEntryOrder;
  public table: Table;
  public table2: Table;

  constructor(
    private bsModalService: BsModalService,
    private bsModalRef: BsModalRef,
    private bsLocaleService: BsLocaleService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private service: EntryOrderService,
    private purchaseOrderService: PurchaseOrderService,
  ) {
    this.bsLocaleService.use('es');

    this.model = this.formBuilder.group({
      id: '',
      idDocument: ['', Validators.required],
      proofSeries: ['', [Validators.required,  Validators.minLength(4), Validators.pattern(/^[0-9a-zA-Z]+$/)]],
      proofNumber: ['', [Validators.required, Validators.pattern(/^([0-9])*$/)]],
      date: [moment().format('DD/MM/YYYY'), Validators.required],
      observation: '',
      proofPaymentType: this.formBuilder.group({ id: 1 }),
      operationType: this.formBuilder.group({ id: 2 }),
      originCostCenter: this.formBuilder.group({ id: '', name: '' }),
      destinyCostCenter: this.formBuilder.group({ id: ['', [Validators.required]], name: '' }),
      state: this.formBuilder.group({ id: 31, name: '', icon:'', color:'' }),
      lstEntryOrderDetail: Array<EntryOrderDetail>
    });
    this.model.get('lstEntryOrderDetail')?.setValue([]);

    this.paged = this.formBuilder.group({
      pageSize: 10,
      pageNumber: 1,
      orderColumn: 'entryOrder.id',
      order: 'DESC',
      lstFilter: this.formBuilder.array(
        [
          this.formBuilder.group({ object: 'entryOrder', column: 'id', value: ['', Validators.pattern(/^[a-zA-Z0-9 ]+$/)], operator: 'equal' }),
          this.formBuilder.group({ object: 'operationType', column: 'id', value: '', operator: 'equal' }),
          this.formBuilder.group({ object: 'entryOrderDetail', column: 'id_item', value: '', operator: 'equal' }),
          this.formBuilder.group({ object: 'entryOrder', column: 'date', value: '', operator: 'rangeDate' }),
          this.formBuilder.group({ object: 'state', column: 'id', value: '31', operator: 'equal' })
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
        { name: 'ALMACEN', width: '40%', style: 'text-start' },
        { name: 'TIPO OPERACIÓN', width: '20%', style: 'text-start' },
        { name: 'N° DOCUMENTO ORIGEN', width: '10%', style: 'text-center' },
        { name: 'FECHA INGRESO', width: '10%', style: 'text-center' },
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
        { name: 'CÓDIGO', width: '10%', style: 'text-center' },
        { name: 'PRODUCTO', width: '55%', style: 'text-start' },
        { name: 'UND. MEDIDA', width: '10%', style: 'text-start' },
        { name: 'CANT. POR RECEPCIONAR', width: '10%', style: 'text-end' },
        { name: 'CANT. RECEPCIONADA', width: '10%', style: 'text-end' }
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
          this.spinner.hide();
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
      this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
    }
  }

  public create() {
    this.setting.mainScreen = true;
    this.setting.operation = 'NUEVO';
    this.setting.onlyView = false;
    this.tableMapper(this.model.get('lstEntryOrderDetail')?.value, this.table2);
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
          this.model.get('idDocument')?.setValue(this.pad(this.model.get('idDocument')?.value, 5, 0));
          this.tableMapper(this.model.get('lstEntryOrderDetail')?.value, this.table2);
          this.spinner.hide();
        } else
          this.errorHandler(response.message);
      },
      error: (err) => { this.exceptionHandler(err) }
    });
  }

  public delete() {
    let initialState = { tipo: 3, opcion: 2 };
    this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
    this.bsModalRef.content.response.subscribe((value: any) => {
      if (value == 'ok') {
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
    let object: any = { id: this.setting.recordId }

    this.spinner.show()
    this.service.findById(object).subscribe({
      next: (response) => {
        if (response !== null && response.status == 'ok') {
          this.spinner.hide()

          var w = 1080;
          var h = 600;
          var left = (window.screen.width / 2) - (w / 2);
          var top = (window.screen.height / 2) - (h / 2) - 20;

          let entryOrder: EntryOrder = response.value

          var mywindow: any = window.open("", "PRINT", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

          mywindow.document.write(`
          <html>
            <head>
              <title>ORDEN DE INGRESO</title>
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
                    <label style="font-size:11px; font-weight: bold;">ORDEN DE INGRESO</label> <br/>
                    <label style="font-size:11px; font-weight: bold;"> Nº de Orden `+ this.pad(entryOrder.id, 5, 0) + `</label>
                  </div>

                </div>

                <br/>

                <div class="row">

                  <div class="col-3">
                    <label> DESTINO :</label> <br/>
                    <label> FECHA INGRESO :</label> <br/>
                    <label> SERIE Y NUMERO COMPROBANTE:</label> <br/>
                  </div>

                  <div class="col-9">
                    <label> `+ entryOrder.destinyCostCenter.name + `</label> <br/>
                    <label> `+ entryOrder.date + `</label> <br/>
                    <label> `+ entryOrder.proofSeries + ' - ' + entryOrder.proofNumber + `</label> <br/>
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
                      <th width="68%" class="th-print text-left">Producto</th>
                      <th width="12%" class="th-print text-center">U. Medida</th>
                      <th width="12%" class="th-print text-center">Valor Unitario</th>
                    </tr>
                  </thead>
                  <tbody>`
          );


          for (let i = 0; i < entryOrder.lstEntryOrderDetail.length; i++) {
            mywindow.document.write(' <tr>')
            mywindow.document.write('    <td class="td-print text-center">' + entryOrder.lstEntryOrderDetail[i].amount) + '</td>'
            mywindow.document.write('    <td class="td-print text-left">' + entryOrder.lstEntryOrderDetail[i].product.name + '</td>')
            mywindow.document.write('    <td class="td-print text-center">' + entryOrder.lstEntryOrderDetail[i].product.unitMeasure.name + '</td>')
            mywindow.document.write('    <td class="td-print text-end">' + entryOrder.lstEntryOrderDetail[i].unitValue) + '</td>'
            mywindow.document.write(' </tr>')
          }

          mywindow.document.write(`
                  </tbody>
                </table>

                <div class="row" style="margin-top:50px;">

                  <div class="offset-2 col-3">
                    <hr>
                  </div>

                </div>

                <div class="row">

                  <div class="offset-2 col-3 text-center">
                    <label> Recibido por: </label> <br/>
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
      let object: EntryOrder = Object.assign({}, this.model.value);
      object.id = object.id.toString() == '' ? 0 : object.id;
      object.proofSeries = object.proofSeries.toUpperCase();
      object.observation = object.observation.toUpperCase();

      let date: any = object.date;
      if (date instanceof Date) object.date = moment(object.date).format('DD/MM/YYYY');

      let array: Array<EntryOrderDetail> = this.model.get('lstEntryOrderDetail')?.value;
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
        });

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
      this.model.markAllAsTouched()
      let initialState = { tipo: 3, opcion: 10 }
      this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
    }
  }

  public exit(updatedRecord?: boolean) {
    this.model.reset({
      id: '',
      idDocument: '',
      proofSeries: '',
      proofNumber: '',
      date: moment().format('DD/MM/YYYY'),
      observation: '',
      proofPaymentType: { id: 1 },
      operationType: { id: 2 },
      originCostCenter: { id: '', name: '' },
      destinyCostCenter: { id: '', name: '' },
      state: { id: 31, name: '', icon:'', color:'' }
    });
    this.model.get('lstEntryOrderDetail')?.setValue([]);

    if (this.setting.stateId == 31)
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

  public searchItem() {
    let lstFilter: Filter[] =  [
      { object: 'itemType', column: 'id', value: '1', operator: 'equal' }
    ];
    let initialState = { lstFilter : lstFilter };

    this.bsModalRef = this.bsModalService.show(ModalProductComponent, { initialState, class: 'modal-xl-custom modal-dialog-centered', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: Product) => {
      if (response != null) {
        let lstFilter = this.paged.get('lstFilter') as FormArray;

        lstFilter.controls[2].get('value')?.setValue(response.id);
        this.setting.filterItem = response.id + ' - ' + response.name;
        this.search();
      }
    });
  }

  public searchCostCenter() {
    this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { class: 'modal-lg modal-dialog-centered', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: CostCenter) => {
      if (response != null) {
        this.model.get('destinyCostCenter')?.get('id')?.setValue(response.id);
        this.model.get('destinyCostCenter')?.get('name')?.setValue(response.name);
      }
    });
  }

  public searchDocument() {
    if (this.model.get('operationType')?.get('id')?.value == 2) { //COMPRA NACIONAL

      let lstFilter: Filter[] =  [
        { object: 'state', column: 'id', value: '12, 15, 16', operator: 'in' },
        { object: 'purchaseOrderDetail', column: 'amount_entry', value: '0', operator: 'greaterThan' }
      ];
      let initialState = { lstFilter : lstFilter };

      this.bsModalRef = this.bsModalService.show(ModalPurchaseOrderComponent, { initialState, class: 'modal-xl modal-dialog-centered', backdrop: 'static' })
      this.bsModalRef.content.response.subscribe((response: PurchaseOrder) => {
        if (response != null) {
          this.cleanDocument();

          let object: any = { id: response.id };

          this.spinner.show();
          this.purchaseOrderService.findById(object).subscribe({
            next: (response) => {
              if (response !== null && response.status == 'ok') {
                let purchaseOrder: PurchaseOrder = response.value;

                this.model.get('idDocument')?.setValue(this.pad(purchaseOrder.id, 5, 0));
                // this.model.get('originCostCenter')?.get('id')?.setValue(purchaseOrder.costCenter.id);
                // this.model.get('destinyCostCenter')?.get('id')?.setValue(purchaseOrder.costCenter.id);
                // this.model.get('destinyCostCenter')?.get('name')?.setValue(purchaseOrder.costCenter.name);

                let array: Array<EntryOrderDetail> = this.model.get('lstEntryOrderDetail')?.value;
                purchaseOrder.lstPurchaseOrderDetail.forEach((item: PurchaseOrderDetail) => {
                  if (item.amountEntry > 0) {
                    let object: EntryOrderDetail = {
                      id: 0,
                      idEntryOrder: 0,
                      idDocumentDetail: item.id,
                      amount: item.amountEntry,
                      amountReception: item.amountEntry,
                      unitValue: item.unitValue,
                      product: {
                        id: item.product.id,
                        name: item.product.name,
                        alternativeCode: item.product.alternativeCode,
                        active: 0,
                        brand: { id: 0, name: '', active: 1 },
                        unitMeasure: { id: 0, name: item.product.unitMeasure.name, sunatCode: '', active: 0 },
                        category: { id: 0, idParent: 0, name: '', path: '', isParent: 0, active: 0, lstCategory: [] }
                      }
                    };
                    array.push(object);
                  };
                });

                this.tableMapper(this.model.get('lstEntryOrderDetail')?.value, this.table2);
                this.spinner.hide()
              } else
                this.errorHandler(response.message);
            },
            error: (err) => { this.exceptionHandler(err) }
          })
        }
      })

    } else if (this.model.get('operationType')?.get('id')?.value == 21) { //ENTRADA POR TRANSFERENCIA

    }
  }

  public cleanItem() {
    let lstFilter = this.paged.get('lstFilter') as FormArray;

    lstFilter.controls[2].get('value')?.setValue('');
    this.setting.filterItem = '';
    this.search();
  }

  public cleanCostCenter() {
    this.model.get('destinyCostCenter')?.get('id')?.setValue('');
    this.model.get('destinyCostCenter')?.get('name')?.setValue('');
  }

  public cleanDocument() {
    this.model.reset({
      id: '',
      idDocument: '',
      proofSeries: '',
      proofNumber: '',
      date: moment().format('DD/MM/YYYY'),
      observation: '',
      proofPaymentType: { id: 1 },
      operationType: { id: 2 },
      originCostCenter: { id: '', name: '' },
      destinyCostCenter: { id: '', name: '' },
      state: { id: 31, name: '', icon:'', color:'' }
    })
    this.model.get('lstEntryOrderDetail')?.setValue([]);
    this.tableMapper(this.model.get('lstEntryOrderDetail')?.value, this.table2);
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
  }

  public editItem() {
    let array: Array<EntryOrderDetail> = this.model.get('lstEntryOrderDetail')?.value;
    let index: number = array.findIndex(x => x.product.id == this.setting.recordId2);
    let object: EntryOrderDetail = array[index];

    let initialState = { object };
    this.bsModalRef = this.bsModalService.show(EntryOrderDetailComponent, { initialState, class: 'modal-xl-custom modal-dialog-custom', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: EntryOrderDetail) => {

      if (response != null) {
        array[index].amountReception = response.amountReception;
      };
    });
  }

  public removeItem() {
    let array: Array<EntryOrderDetail> = this.model.get('lstEntryOrderDetail')?.value;
    let index: number = array.findIndex(x => x.product.id == this.setting.recordId2);
    array.splice(index, 1);
    this.tableMapper(this.model.get('lstEntryOrderDetail')?.value, this.table2);

    this.setting.recordId2 = 0;
  }

  public selectRecord(record: any) {
    this.setting.recordId = record.id;
    this.setting.stateId = record.state.id;

    if (this.setting.stateId == 31)
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

  public onKeyPressNumeros(event: any) {
    let pattern = /^([0-9])*$/
    let inputChar = String.fromCharCode(event.charCode)

    if (!pattern.test(inputChar)) {
      event.preventDefault()
    }
  }

  public onKeyPressLetrasNumeros(event: any) {
    let pattern = /^[0-9a-zA-Z]+$/
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
