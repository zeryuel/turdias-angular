import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule } from 'ngx-spinner';
declare var $: any;

import { DepartureOrderDetail } from '../../interfaces/departure-order-detail.interface';
import { ModalInventoryComponent } from '../../../shared/components/modal-inventory/modal-inventory.component';
import { Filter } from '../../../../shared/interfaces/filter.interface';
import { Inventory } from '../../../inventory/interfaces/inventory.interface';
import { CostCenter } from '../../../cost-center/interfaces/cost-center.interface';

@Component({
  selector: 'app-departure-order-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './departure-order-detail.component.html'
})
export class DepartureOrderDetailComponent {
  public object: DepartureOrderDetail | undefined;
  public almacen: CostCenter | undefined;
  public model: FormGroup;

  @Output() response = new EventEmitter();
  @ViewChild('txtAmount', { static: false }) txtAmount!: ElementRef;
  @ViewChild('btnConfirm', { static: false }) btnConfirm!: ElementRef;

  constructor(
    private bsModalService: BsModalService,
    public bsModalRef: BsModalRef,
    public bsModalRefItem: BsModalRef,
    private formBuilder: FormBuilder) {

    this.model = this.formBuilder.group({
      id: '0',
      idDepartureOrder: '0',
      idEntryOrderDetail: '0',
      stock: '',
      amount: ['', [Validators.required]],
      unitValue: '',
      item: this.formBuilder.group({
        id: ['', [Validators.required]],
        name: '',
        alternativeCode: '',
        itemBrand: this.formBuilder.group({ id: '', name: '' }),
        itemUnitMeasure: this.formBuilder.group({ id: '', name: '' })
      }),
      costCenter: this.formBuilder.group({
        id: '',
        name: ''
      })
    });
  }

  ngOnInit(): void {
    $(document).ready(function () {
      let modalContent: any = $('.modal-content');
      modalContent.draggable({
        handle: '.modal-header'
      });
    });

    console.log(this.almacen)

    if (this.object != undefined) {
      this.model.get('id')?.setValue(this.object.id);
      this.model.get('idDepartureOrder')?.setValue(this.object.idDepartureOrder);
      this.model.get('idEntryOrderDetail')?.setValue(this.object.idEntryOrderDetail);
      this.model.get('stock')?.setValue('');
      this.model.get('amount')?.setValue(this.object.amount);
      this.model.get('unitValue')?.setValue(this.object.unitValue);

      this.model.get('item')?.get('id')?.setValue(this.pad(this.object.product.id, 3, 0));
      this.model.get('item')?.get('name')?.setValue(this.object.product.name);
      this.model.get('item')?.get('itemBrand')?.get('id')?.setValue(this.object.product.brand.id);
      this.model.get('item')?.get('itemBrand')?.get('name')?.setValue(this.object.product.brand.name);
      this.model.get('item')?.get('itemUnitMeasure')?.get('id')?.setValue(this.object.product.unitMeasure.id);
      this.model.get('item')?.get('itemUnitMeasure')?.get('name')?.setValue(this.object.product.unitMeasure.name);
    }

    this.model.get('costCenter')?.get('id')?.setValue(this.almacen?.id);
    this.model.get('costCenter')?.get('name')?.setValue(this.almacen?.name);

  }

  public searchInventory() {

    let lstFilter: Filter[] =  [
      { object: 'costCenter', column: 'id', value: this.model.get('costCenter')?.get('id')?.value, operator: 'equal' }
    ];
    let initialState = { lstFilter : lstFilter };

    this.bsModalRefItem = this.bsModalService.show(ModalInventoryComponent, { initialState, class: 'modal-xl-custom modal-dialog-centered', backdrop: 'static' })
    this.bsModalRefItem.content.response.subscribe((response: Inventory) => {
      if (response != null) {

        this.model.get('item')?.get('id')?.setValue(this.pad(response.product.id, 3, 0));
        this.model.get('item')?.get('name')?.setValue(response.product.name);
        this.model.get('item')?.get('alternativeCode')?.setValue(response.product.alternativeCode);
        this.model.get('item')?.get('itemBrand')?.get('id')?.setValue(response.product.brand.id);
        this.model.get('item')?.get('itemBrand')?.get('name')?.setValue(response.product.brand.name);
        this.model.get('item')?.get('itemUnitMeasure')?.get('id')?.setValue(response.product.unitMeasure.id);
        this.model.get('item')?.get('itemUnitMeasure')?.get('name')?.setValue(response.product.unitMeasure.name);
        this.model.get('stock')?.setValue(response.stock);
        this.model.get('unitValue')?.setValue(response.unitValue);

        this.txtAmount.nativeElement.focus();
      }
    })
  }

  public cleanInventory() {
    this.model.get('item')?.get('id')?.setValue('');
    this.model.get('item')?.get('name')?.setValue('');
    this.model.get('item')?.get('itemBrand')?.get('id')?.setValue('');
    this.model.get('item')?.get('itemBrand')?.get('name')?.setValue('');
    this.model.get('item')?.get('itemUnitMeasure')?.get('id')?.setValue('');
    this.model.get('item')?.get('itemUnitMeasure')?.get('name')?.setValue('');
  }

  public onKeyPressNumeros(event: any) {
    let pattern = /^([0-9])*$/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    };
  }

  public onKeyPressDecimales(event: any) {
    const pattern = /[0-9.]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  public onKeyUpAmount() {
    this.btnConfirm.nativeElement.focus();
  }

  private pad(n: any, width: number, z: any) {
    z = z || '0';
    n = n + '';

    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  public confirm(): void {
    if (this.model.valid) {
      let response: DepartureOrderDetail = {
        id: parseInt(this.model.get('id')?.value),
        idDepartureOrder: 0,
        idEntryOrderDetail: 0,
        amount: parseFloat(this.model.get('amount')?.value),
        unitValue: parseFloat(this.model.get('unitValue')?.value),
        stock: parseFloat(this.model.get('stock')?.value),
        product: {
          id: parseInt(this.model.get('item')?.get('id')?.value),
          name: this.model.get('item')?.get('name')?.value,
          alternativeCode: this.model.get('item')?.get('alternativeCode')?.value,
          active: 0,
          brand: { id: 0, name: this.model.get('item')?.get('itemBrand')?.get('name')?.value, active: 1 },
          unitMeasure: { id: 0, name: this.model.get('item')?.get('itemUnitMeasure')?.get('name')?.value, sunatCode: '', active: 0 },
          category: { id: 0, idParent: 0, name: '', path: '', isParent: 0, active: 0, lstCategory: [] }
        },

      };
      this.response.emit(response);
      this.bsModalRef.hide();

    } else {
      this.model.markAllAsTouched();
    };
  }

  public cancel(): void {
    this.response.emit(null);
    this.bsModalRef.hide();
  }
}
