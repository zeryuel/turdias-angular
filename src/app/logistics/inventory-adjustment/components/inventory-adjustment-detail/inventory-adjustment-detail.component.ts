import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule } from 'ngx-spinner';
declare var $: any;

import { ModalProductComponent } from '../../../shared/components/modal-product/modal-product.component';
import { InventoryAdjustmentDetail } from '../../interfaces/inventory-adjustment-detail.interface';
import { Filter } from '../../../../shared/interfaces/filter.interface';
import { Product } from '../../../product/interfaces/product.interface';

@Component({
  selector: 'app-inventory-adjustment-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './inventory-adjustment-detail.component.html'
})
export class InventoryAdjustmentDetailComponent {
  public object: InventoryAdjustmentDetail | undefined;
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
      idInventoryAdjustment: '0',
      amount: ['', [Validators.required]],
      item: this.formBuilder.group({
        id: ['', [Validators.required]],
        name: '',
        alternativeCode: '',
        itemUnitMeasure: this.formBuilder.group({ id: '', name: '' })
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

    if (this.object != undefined) {
      this.model.get('id')?.setValue(this.object.id);
      this.model.get('idInventoryAdjustment')?.setValue(this.object.idInventoryAdjustment);
      this.model.get('amount')?.setValue(this.object.amount);
      this.model.get('item')?.get('id')?.setValue(this.pad(this.object.product.id, 3, 0));
      this.model.get('item')?.get('name')?.setValue(this.object.product.name);
      this.model.get('item')?.get('itemUnitMeasure')?.get('id')?.setValue(this.object.product.unitMeasure.id);
      this.model.get('item')?.get('itemUnitMeasure')?.get('name')?.setValue(this.object.product.unitMeasure.name);
    }
  }

  public searchItem() {
    let lstFilter: Filter[] =  [
      { object: 'itemType', column: 'id', value: '1', operator: 'equal' }
    ];
    let initialState = { lstFilter : lstFilter };

    this.bsModalRefItem = this.bsModalService.show(ModalProductComponent, { initialState, class: 'modal-xl-custom modal-dialog-centered', backdrop: 'static' })
    this.bsModalRefItem.content.response.subscribe((result: Product) => {
      if (result != null) {
        this.model.get('item')?.get('id')?.setValue(this.pad(result.id, 3, 0));
        this.model.get('item')?.get('name')?.setValue(result.name);
        this.model.get('item')?.get('itemUnitMeasure')?.get('id')?.setValue(result.unitMeasure.id);
        this.model.get('item')?.get('itemUnitMeasure')?.get('name')?.setValue(result.unitMeasure.name);
        this.txtAmount.nativeElement.focus();
      }
    })
  }

  public cleanItem() {
    this.model.get('item')?.get('id')?.setValue('');
    this.model.get('item')?.get('name')?.setValue('');
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
      let response: InventoryAdjustmentDetail = {
        id: parseInt(this.model.get('id')?.value),
        idInventoryAdjustment: 0,
        amount: parseFloat(this.model.get('amount')?.value),
        product: {
          id: parseInt(this.model.get('item')?.get('id')?.value),
          name: this.model.get('item')?.get('name')?.value,
          alternativeCode: this.model.get('item')?.get('alternativeCode')?.value,
          brand: { id: 0, name: '' },
          unitMeasure: { id: 0, name: this.model.get('item')?.get('itemUnitMeasure')?.get('name')?.value, sunatCode: ''},
          category: { id: 0, idParent: 0, name: '', path: '', isParent: 0, lstCategory: [] }
        }
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
