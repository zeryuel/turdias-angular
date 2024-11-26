import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule } from 'ngx-spinner';
declare var $: any;

import { EntryOrderDetail } from '../../interfaces/entry-order-detail.interface';

@Component({
  selector: 'app-entry-order-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './entry-order-detail.component.html'
})
export class EntryOrderDetailComponent {
  public object: EntryOrderDetail | undefined;
  public model: FormGroup= new FormGroup({});

  @Output() response = new EventEmitter();

  constructor(
    public bsModalRef: BsModalRef
    , private formBuilder: FormBuilder) {

    this.model = this.formBuilder.group({
      id: '0',
      idEntryOrder: '0',
      idDocumentDetail: '0',
      amount: '',
      amountReception: ['', [Validators.required]],
      unitValue: '',
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
      this.model.get('idEntryOrder')?.setValue(this.object.idEntryOrder);
      this.model.get('idDocumentDetail')?.setValue(this.object.idDocumentDetail);
      this.model.get('amount')?.setValue(this.object.amount);
      this.model.get('amountReception')?.setValue(this.object.amountReception);
      this.model.get('unitValue')?.setValue(this.object.unitValue);

      this.model.get('item')?.get('id')?.setValue(this.pad(this.object.product.id, 3, 0));
      this.model.get('item')?.get('name')?.setValue(this.object.product.name);
      this.model.get('item')?.get('itemUnitMeasure')?.get('id')?.setValue(this.object.product.unitMeasure.id);
      this.model.get('item')?.get('itemUnitMeasure')?.get('name')?.setValue(this.object.product.unitMeasure.name);
    }
  }

  public onKeyPressNumeros(event: any) {
    let pattern = /^([0-9])*$/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    };
  }

  private pad(n: any, width: number, z: any) {
    z = z || '0';
    n = n + '';

    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  public confirm(): void {
    if (this.model.valid) {
      let response: EntryOrderDetail = {
        id: parseInt(this.model.get('id')?.value),
        idEntryOrder: parseInt(this.model.get('idEntryOrder')?.value),
        idDocumentDetail: parseInt(this.model.get('idDocumentDetail')?.value),
        amount: parseFloat(this.model.get('amount')?.value),
        amountReception: parseFloat(this.model.get('amountReception')?.value),
        unitValue: parseFloat(this.model.get('unitValue')?.value),
        product: {
          id: parseInt(this.model.get('item')?.get('id')?.value),
          name: this.model.get('item')?.get('name')?.value,
          alternativeCode: this.model.get('item')?.get('alternativeCode')?.value,
          active: 0,
          brand: { id: 0, name: '', active: 1 },
          unitMeasure: { id: 0, name:  this.model.get('item')?.get('itemUnitMeasure')?.get('name')?.value, sunatCode: '', active: 0 },
          category: { id: 0, idParent: 0, name: '', path: '', isParent: 0, active: 0, lstCategory: [] }
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
