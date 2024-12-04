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
import { ProofPaymentService } from './services/proof-payment.service';
import { PurchaseOrderService } from '../purchase-order/services/purchase-order.service';
import { ModalMessageComponent } from '../../shared/components/modal-message/modal-message.component';
import { ProofPayment } from './interfaces/proof-payment.interface';
import { ModalSupplierComponent } from '../shared/components/modal-supplier/modal-supplier.component';
import { ModalPurchaseOrderComponent } from '../shared/components/modal-purchase-order/modal-purchase-order.component';
import { PurchaseOrder } from '../purchase-order/interfaces/purchase-order.interface';
import { ProofPaymentDetail } from './interfaces/proof-payment-detail.interface';
import { SettingProofPayment } from './interfaces/setting-proof-payment.interface';
import { Supplier } from '../supplier/interfaces/supplier.interface';
import { Filter } from '../../shared/interfaces/filter.interface';
import { PurchaseOrderDetail } from '../purchase-order/interfaces/purchase-order-detail.interface';

@Component({
  selector: 'app-proof-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule, BsDatepickerModule, FormsModule],
  templateUrl: './proof-payment.component.html'
})
export class ProofPaymentComponent {
  @ViewChild('filterSeries') filterSeries!: ElementRef;

  public model: FormGroup;
  public paged: FormGroup;
  public setting: SettingProofPayment;
  public table: Table;
  public table2: Table;

  constructor(
    private bsModalService: BsModalService,
    private bsModalRef: BsModalRef,
    private bsLocaleService: BsLocaleService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private service: ProofPaymentService,
    private ordenCompraService: PurchaseOrderService
  ) {
    this.bsLocaleService.use('es');

    this.model = this.formBuilder.group({
      id: '',
      idPurchaseOrder: ['', Validators.required],
      series: ['', [Validators.required,  Validators.minLength(4), Validators.pattern(/^[0-9a-zA-Z]+$/)]],
      number: ['', [Validators.required, Validators.pattern(/^([0-9])*$/)]],
      emissionDate: [moment().format('DD/MM/YYYY'), Validators.required],
      expirationDate: [moment().format('DD/MM/YYYY'), Validators.required],
      exchangeRate: 0,
      creditDays: 0,
      taxValue: 0,
      saleValue: '0.00',
      saleTax: '0.00',
      salePrice: '0.00',
      proofPaymentType: this.formBuilder.group({ id: [{ value: 1, disabled: true }] }),
      supplier: this.formBuilder.group({ id: ['', [Validators.required]], ruc:'', reasonSocial: '' }),
      paymentMethod: this.formBuilder.group({ id: 1 }),
      currency: this.formBuilder.group({ id: [{ value: 1, disabled: true }] }),
      state: this.formBuilder.group({ id: 21, name: '', icon:'', color:'' }),
      lstProofPaymentDetail: Array<ProofPaymentDetail>
    })
    this.model.get('lstProofPaymentDetail')?.setValue([]);

    this.paged = this.formBuilder.group({
      pageSize: 10,
      pageNumber: 1,
      orderColumn: 'proofPayment.id',
      order: 'DESC',
      lstFilter: this.formBuilder.array(
        [
          this.formBuilder.group({ object: 'proofPayment', column: 'series', value: ['', [Validators.minLength(4), Validators.pattern(/^[0-9a-zA-Z]+$/)]], operator: 'like' }),
          this.formBuilder.group({ object: 'proofPayment', column: 'number', value: ['', [Validators.pattern(/^([0-9])*$/)]], operator: 'equal' }),
          this.formBuilder.group({ object: 'proofPaymentType', column: 'id', value: '', operator: 'equal' }),
          this.formBuilder.group({ object: 'supplier', column: 'id', value: '', operator: 'equal' }),
          this.formBuilder.group({ object: 'proofPayment', column: 'emission_date', value: '', operator: 'rangeDate' }),
          this.formBuilder.group({ object: 'state', column: 'id', value: '', operator: 'equal' })
        ]
      )
    })

    this.setting = {
      recordId: 0,
      recordId2: 0,
      operation: '',
      onlyView: false,
      mainScreen: false,
      currencyAcronym: 'S/.',
      taxValue : 0,
      idState: 0,
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
        { name: 'SERIE', width: '5%', style: 'text-center' },
        { name: 'NUMERO', width: '5%', style: 'text-center' },
        { name: 'TIPO COMPROBANTE', width: '9%', style: 'text-center' },
        { name: 'PROVEEDOR', width: '30%', style: 'text-start' },
        { name: 'FECHA EMISION', width: '8%', style: 'text-center' },
        { name: 'N° COMPRA', width: '5%', style: 'text-center' },
        { name: 'MONEDA', width: '4%', style: 'text-center' },
        { name: 'VALOR VENTA', width: '8%', style: 'text-end' },
        { name: 'IMPUESTO', width: '6%', style: 'text-end' },
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
    this.spinner.show()
    this.service.setting(object).subscribe({
      next: (response) => {
        if (response !== null && response.status == 'ok') {
          this.paginationMapper(response.value.page.value, this.table);
          this.setting.lstProofPaymentType = response.value.lstProofPaymentType.value
          this.setting.lstCurrency = response.value.lstCurrency.value
          this.setting.lstPaymentMethod = response.value.lstPaymentMethod.value
          this.setting.lstState = response.value.lstState.value

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
      this.paged.markAllAsTouched()
      let initialState = { tipo: 3, opcion: 10 }
      this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
    }
  }

  public create() {
    this.setting.operation = 'NUEVO';
    this.setting.mainScreen = true;
    this.setting.onlyView = false;
    this.tableMapper(this.model.get('lstProofPaymentDetail')?.value, this.table2);
  }

  public update() {
    this.setting.operation = 'MODIFICAR';
    this.setting.mainScreen = true;

    let object: any = { id: this.setting.recordId };

    this.spinner.show()
    this.service.findById(object).subscribe({
      next: (response) => {
        if (response !== null && response.status == 'ok') {
          this.model.patchValue(response.value);
          this.model.get('idPurchaseOrder')?.setValue(this.pad(this.model.get('idPurchaseOrder')?.value, 5, 0));
          this.model.get('number')?.setValue(this.pad(this.model.get('number')?.value, 6, 0));

          if (this.model.get('state')?.get('id')?.value == 21)
            this.setting.onlyView = false;
          else
            this.setting.onlyView = true;

          this.tableMapper(this.model.get('lstProofPaymentDetail')?.value, this.table2);
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

      if (value == 'ok') {
        let object: any = { id: this.setting.recordId };

        this.spinner.show()
        this.service.delete(object).subscribe({
          next: (response) => {
            if (response !== null && response.status == 'ok') {
              this.setting.recordId = 0;

              setTimeout(() => {
                initialState = { tipo: 4, opcion: 1 }
                this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
                this.search()
              }, 200);
            } else
              setTimeout(() => { this.errorHandler(response.message); }, 200);
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
      this.model.get('proofPaymentType')?.get('id')?.enable();
      this.model.get('currency')?.get('id')?.enable();

      let object: ProofPayment = Object.assign({}, this.model.value);
      object.id = object.id.toString() == '' ? 0 : object.id;
      object.series = object.series.toUpperCase();

      let emissionDate: any = object.emissionDate;
      let expirationDate: any = object.expirationDate;

      if (emissionDate instanceof Date) object.emissionDate = moment(object.emissionDate).format('DD/MM/YYYY');
      if (expirationDate instanceof Date) object.expirationDate = moment(object.expirationDate).format('DD/MM/YYYY');

      let array: Array<ProofPaymentDetail> = this.model.get('lstProofPaymentDetail')?.value;
      if (array.length == 0) {
        let initialState = { tipo: 3, opcion: 12 }
        this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
        return;
      }

      if (object.id == 0) {
        this.spinner.show()
        this.service.insert(object).subscribe({
          next: (response) => {
            if (response !== null && response.status == 'ok') {
              let initialState: any = { tipo: 1, opcion: 1 }
              this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
              this.bsModalRef.content.response.subscribe(() => { this.exit(true) });
              this.spinner.hide();
            } else
              this.errorHandler(response.message);
          },
          error: (err) => { this.exceptionHandler(err) }
        })

      } else {
        this.spinner.show()
        this.service.update(object).subscribe({
          next: (response) => {
            if (response !== null && response.status == 'ok') {
              let initialState: any = { tipo: 1, opcion: 2 }
              this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
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
      this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
    }
  }

  public exit(updatedRecord?: boolean) {
    this.model.reset({
      id: '',
      idPurchaseOrder: '',
      series: '',
      number: '',
      emissionDate: moment().format('DD/MM/YYYY'),
      expirationDate: moment().format('DD/MM/YYYY'),
      exchangeRate: 0,
      creditDays: 0,
      taxValue: 0,
      saleValue: '0.00',
      saleTax: '0.00',
      salePrice: '0.00',
      proofPaymentType: { id: 1 },
      supplier: { id: '', ruc:'', reasonSocial: '' },
      paymentMethod: { id: 1 },
      currency: { id: 1 },
      state: { id: 21, name: '', icon:'', color:'' }
    });
    this.model.get('lstProofPaymentDetail')?.setValue([]);

    this.model.get('proofPaymentType')?.get('id')?.disable();
    this.model.get('currency')?.get('id')?.disable();

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

        lstFilter.controls[3].get('value')?.setValue(response.id);
        this.setting.filterSupplier = response.ruc + ' - ' + response.reasonSocial;
        this.search();
      }
    });
  }

  public searchPurchaseOrder() {
    let lstFilter: Filter[] =  [
      { object: 'state', column: 'id', value: '12, 15', operator: 'in' },
      { object: 'purchaseOrderDetail', column: 'amount_proof', value: '0', operator: 'greaterThan' }
    ];
    let initialState = { lstFilter : lstFilter };

    this.bsModalRef = this.bsModalService.show(ModalPurchaseOrderComponent, { initialState, class: 'modal-xl modal-dialog-centered', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: PurchaseOrder) => {
      if (response != null) {
        this.cleanPurchaseOrder();

        let object: any = { id: response.id };

        this.spinner.show();
        this.ordenCompraService.findById(object).subscribe({
          next: (response) => {
            if (response !== null && response.status == 'ok') {
              let purchaseOrder: PurchaseOrder = response.value;

              this.model.get('idPurchaseOrder')?.setValue(this.pad(purchaseOrder.id, 5, 0));
              this.model.get('proofPaymentType')?.get('id')?.setValue(purchaseOrder.proofPaymentType.id);
              this.model.get('supplier')?.get('id')?.setValue(purchaseOrder.supplier.id);
              this.model.get('supplier')?.get('ruc')?.setValue(purchaseOrder.supplier.ruc);
              this.model.get('supplier')?.get('reasonSocial')?.setValue(purchaseOrder.supplier.reasonSocial);
              this.model.get('currency')?.get('id')?.setValue(purchaseOrder.currency.id);
              this.model.get('paymentMethod')?.get('id')?.setValue(purchaseOrder.paymentMethod.id);
              this.model.get('saleValue')?.setValue(purchaseOrder.saleValue);
              this.model.get('saleTax')?.setValue(purchaseOrder.saleTax);
              this.model.get('salePrice')?.setValue(purchaseOrder.salePrice);

              let array: Array<ProofPaymentDetail> = this.model.get('lstProofPaymentDetail')?.value;
              purchaseOrder.lstPurchaseOrderDetail.forEach((item: PurchaseOrderDetail) => {
                let object: ProofPaymentDetail = {
                  id: 0,
                  idProofPayment: 0,
                  idPurchaseOrderDetail: item.id,
                  amount: item.amount,
                  unitValue: item.unitValue,
                  unitPrice: item.unitPrice,
                  unitTax: item.unitTax,
                  product: {
                    id: item.product.id,
                    name: item.product.name,
                    alternativeCode: item.product.alternativeCode,
                    brand: { id: 0, name: '' },
                    unitMeasure: { id: 0, name: item.product.unitMeasure.name, sunatCode: '' },
                    category: { id: 0, idParent: 0, name: '', path: '', isParent: 0, lstCategory: [] }
                  }
                };
                array.push(object);
              });


              this.tableMapper(this.model.get('lstProofPaymentDetail')?.value, this.table2);
              this.spinner.hide();
            } else
              this.errorHandler(response.message);
          },
          error: (err) => { this.exceptionHandler(err) }
        });
      }
    })
  }

  public cleanSupplier() {
    let lstFilter = this.paged.get('lstFilter') as FormArray;

    lstFilter.controls[3].get('value')?.setValue('');
    this.setting.filterSupplier = '';
    this.search();
  }

  public cleanPurchaseOrder() {
    this.model.reset({
      id: '',
      idPurchaseOrder: '',
      series: '',
      number: '',
      emissionDate: moment().format('DD/MM/YYYY'),
      expirationDate: moment().format('DD/MM/YYYY'),
      exchangeRate: 0,
      creditDays: 0,
      taxValue: 0,
      saleValue: '0.00',
      saleTax: '0.00',
      salePrice: '0.00',
      proofPaymentType: { id: 1 },
      supplier: { id: '', ruc:'', reasonSocial: '' },
      paymentMethod: { id: 1, name: '' },
      currency: { id: 1, name: '' },
      state: { id: 21, name: '', icon:'', color:'' }
    });
    this.model.get('lstProofPaymentDetail')?.setValue([]);
    this.tableMapper(this.model.get('lstProofPaymentDetail')?.value, this.table2);
  }

  public cleanRangeDate() {
    let lstFilter = this.paged.get('lstFilter') as FormArray;

    if (lstFilter.controls[4].get('value')?.value != '') {
      lstFilter.controls[4].get('value')?.setValue('');
      this.setting.filterRangeDate = [];
      this.search();
    }
  }

  public removeItem() {
    let array: Array<ProofPaymentDetail> = this.model.get('lstProofPaymentDetail')?.value;
    let index: number = array.findIndex(x => x.product.id == this.setting.recordId2);
    array.splice(index, 1);

    this.setting.recordId2 = 0;
    this.calculteTotals();
  }

  private calculteTotals() {
    let saleValue: number = 0;
    let saleTax: number = 0;
    let salePrice: number = 0;

    let array: Array<ProofPaymentDetail> = this.model.get('lstProofPaymentDetail')?.value;

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
    this.setting.idState = parseInt(record.state.id);

    if (this.setting.idState == 21)
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
