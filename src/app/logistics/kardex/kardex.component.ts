import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';

import { KardexService } from './services/kardex.service';
import { Kardex } from './interfaces/kardex.interface';
import { ModalMessageComponent } from '../../shared/components/modal-message/modal-message.component';
import { ModalProductComponent } from '../shared/components/modal-product/modal-product.component';
import { ModalCostCenterComponent } from '../shared/components/modal-cost-center/modal-cost-center.component';
import { Product } from '../product/interfaces/product.interface';
import { Filter } from '../../shared/interfaces/filter.interface';
import { CostCenter } from '../cost-center/interfaces/cost-center.interface';
import { Parameter } from '../../shared/interfaces/parameter.interface';

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule, BsDatepickerModule, FormsModule],
  templateUrl: './kardex.component.html'
})
export class KardexComponent {

  public model: FormGroup;
  public setting:  { recordId: number };
  public table: any;
  public lstKardex: Array<Kardex>;

  constructor(
    private bsModalService: BsModalService,
    public bsModalRef: BsModalRef,
    private bsLocaleService: BsLocaleService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private service: KardexService
  ) {
    this.bsLocaleService.use('es');
    this.lstKardex = [];
    this.model = this.formBuilder.group({
      costCenter: this.formBuilder.group({ id: ['', [Validators.required]], name: '' }),
      item: this.formBuilder.group({ id: ['', [Validators.required]], name: '', unitMeasureName: '' }),
      startDate: [moment().add(-30, 'days').format('DD/MM/YYYY'), Validators.required],
      endDate: [moment().format('DD/MM/YYYY'), Validators.required]
    });

    this.setting = { recordId: 0 };

    this.table = {
      orderColumn: -1,
      hight: 372,
      lstColumnGroup: [
        { name: 'DOCUMENTO DE TRASLADO, COMPROBANTE DE PAGO, DOCUMENTO INTERNO O SIMILAR', colspan: '6', style: 'text-center' },
        { name: 'ENTRADAS', colspan: '3', style: 'text-center' },
        { name: 'SALIDAS', colspan: '3', style: 'text-center' },
        { name: 'SALDO FINAL', colspan: '3', style: 'text-center' }
      ],
      lstColumn: [
        { name: 'N°', width: '5%', style: 'text-center' },
        { name: 'FECHA', width: '6%', style: 'text-center' },
        { name: 'TIPO COMPROBANTE', width: '8%', style: 'text-start' },
        { name: 'SERIE', width: '4%', style: 'text-center' },
        { name: 'NUMERO', width: '5%', style: 'text-center' },
        { name: 'TIPO DE OPERACIÓN', width: '15%', style: 'text-start' },
        { name: 'CANTIDAD', width: '6%', style: 'text-end' },
        { name: 'COSTO UNIT.', width: '6%', style: 'text-end' },
        { name: 'COSTO TOTAL', width: '7%', style: 'text-end' },
        { name: 'CANTIDAD', width: '6%', style: 'text-end' },
        { name: 'COSTO UNIT.', width: '6%', style: 'text-end' },
        { name: 'COSTO TOTAL', width: '7%', style: 'text-end' },
        { name: 'CANTIDAD', width: '6%', style: 'text-end' },
        { name: 'COSTO UNIT.', width: '6%', style: 'text-end' },
        { name: 'COSTO TOTAL', width: '7%', style: 'text-end' }
      ]
    }
  }

  public search() {
    if (this.model.valid) {
      let idCostCenter: any = this.model.get('costCenter')?.get('id')?.value;
      let idItem: any = this.model.get('item')?.get('id')?.value;
      let startDate: any = this.model.get('startDate')?.value;
      let endDate: any = this.model.get('endDate')?.value;

      if (startDate instanceof Date) startDate = moment(startDate).format('DD/MM/YYYY');
      if (endDate instanceof Date) endDate = moment(endDate).format('DD/MM/YYYY');

      let lstParameter: Array<Parameter> = [
        { name: 'idCostCenter', value: idCostCenter },
        { name: 'idItem', value: idItem },
        { name: 'startDate', value: startDate },
        { name: 'endDate', value: endDate }
      ];

      this.spinner.show()
      this.service.findMoves(lstParameter).subscribe({
        next: (response) => {
          if (response !== null && response.status == 'ok') {
            this.lstKardex = response.value;
            this.spinner.hide()
          } else
            this.errorHandler(response.message);
        },
        error: (err) => { this.exceptionHandler(err) }
      })

    } else {
      this.model.markAllAsTouched()
      let initialState = { tipo: 3, opcion: 10 }
      this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
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
        this.model.get('item')?.get('id')?.setValue(this.pad(response.id, 3, 0));
        this.model.get('item')?.get('name')?.setValue(response.name);
        this.model.get('item')?.get('unitMeasureName')?.setValue(response.unitMeasure.name);
      }
    });
  }

  public searchCostCenter() {
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

  public cleanItem() {
    this.model.get('item')?.get('id')?.setValue('');
    this.model.get('item')?.get('name')?.setValue('');
    this.model.get('item')?.get('unitMeasureName')?.setValue('');
  }

  public cleanCostCenter() {
    this.model.get('costCenter')?.get('id')?.setValue('');
    this.model.get('costCenter')?.get('name')?.setValue('');
  }

  public selectRecord(record: any) {
    this.setting.recordId = record.id;
  }

  public onKeyPressAlfaNumerico(event: any) {
    let pattern = /^[a-zA-Z0-9 ]+$/
    let inputChar = String.fromCharCode(event.charCode)

    if (!pattern.test(inputChar)) {
      event.preventDefault()
    }
  }

  public onChangeInvalidDate(event: any) {
    let mensaje = event.target.value;

    if (mensaje == 'Invalid date') {
      event.target.value = 'fecha invalida'
    }
  }

  public onKeyPressDate(event: any) {
    let pattern = /^([0-9,/])*$/
    let inputChar = String.fromCharCode(event.charCode)

    if (!pattern.test(inputChar)) {
      event.preventDefault()
    }
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
