import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule } from 'ngx-spinner';
declare var $: any;

import { PurchaseOrderDetail } from '../../interfaces/purchase-order-detail.interface';
import { ModalProductComponent } from '../../../shared/components/modal-product/modal-product.component';
import { Filter } from '../../../../shared/interfaces/filter.interface';
import { Product } from '../../../product/interfaces/product.interface';
import { ModalCostCenterComponent } from '../../../shared/components/modal-cost-center/modal-cost-center.component';
import { CostCenter } from '../../../cost-center/interfaces/cost-center.interface';
import { TypeaheadMatch, TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { map, Observable, Observer, of, switchMap, tap } from 'rxjs';
import { CostCenterService } from '../../../cost-center/services/cost-center.service';
import { Paged } from '../../../../shared/interfaces/paged.interface';
import { Page } from '../../../../shared/interfaces/page.interface';
import { Response } from '../../../../shared/interfaces/response.interface';
import { ProductService } from '../../../product/services/product.service';

@Component({
  selector: 'app-purchase-order-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule, TypeaheadModule],
  templateUrl: './purchase-order-detail.component.html'
})
export class PurchaseOrderDetailComponent {
  @Output() response = new EventEmitter();
  @ViewChild('costCenterName') costCenterName!: ElementRef;
  @ViewChild('productName') productName!: ElementRef;
  @ViewChild('amount') amount!: ElementRef;
  @ViewChild('unitValue') unitValue!: ElementRef;
  @ViewChild('btnConfirm') btnConfirm!: ElementRef;

  public object: PurchaseOrderDetail | undefined;
  public model: FormGroup;

  dataCostCenter$?: Observable<CostCenter[]>;
  errorCostCenter?: string;
  loadingCostCenter?: boolean;
  noResultCostCenter = false;

  dataProduct$?: Observable<Product[]>;
  errorProduct?: string;
  loadingProduct?: boolean;
  noResultProduct = false;

  constructor(
    private bsModalService: BsModalService,
    public bsModalRef: BsModalRef,
    public bsModalRefItem: BsModalRef,
    public bsModalRefCostCenter: BsModalRef,
    private formBuilder: FormBuilder,
    private costCenterService: CostCenterService,
    private productService: ProductService
  ) {

    this.model = this.formBuilder.group({
      id: '0',
      idPurchaseOrder: '0',
      amount: ['', [Validators.required]],
      amountEntry: 0,
      amountProof: 0,
      unitValue: ['', [Validators.required]],
      unitTax: '',
      unitPrice: '0',
      costCenter: this.formBuilder.group({
        id: ['', [Validators.required]],
        name: ''
      }),
      product: this.formBuilder.group({
        id: ['', [Validators.required]],
        name: '',
        alternativeCode: '',
        brand: this.formBuilder.group({ id: '', name: '' }),
        unitMeasure: this.formBuilder.group({ id: '', name: '' })
      }),
      subTotal: ''
    });
  }

  ngOnInit(): void {
    $(document).ready(function () {
      let modalContent: any = $('.modal-content');
      modalContent.draggable({
        handle: '.modal-header'
      });
    });

    this.dataProduct$ = new Observable((observer: Observer<string | undefined>) => {
      observer.next(this.model.get('product')?.get('name')?.value);
    }).pipe(
      switchMap((query: string) => {
        if (query) {

          let paged: Paged = {
            pageSize: 20,
            pageNumber: 1,
            orderColumn: "product.name",
            order: "ASC",
            lstFilter: [{ object: "product", column: "name", value: query, operator: "like" }]
          }
          return this.productService.findByPagination(paged).pipe(
            map((data: Response<Page>) => data && data.value.content || []),
            tap({
              next: x => { },
              error: err => { this.errorProduct = err && err.message || 'Error en la consulta'; }
            })
          );
        }

        return of([]);
      })
    );

    this.dataCostCenter$ = new Observable((observer: Observer<string | undefined>) => {
      observer.next(this.model.get('costCenter')?.get('name')?.value);
    }).pipe(
      switchMap((query: string) => {
        if (query) {

          let paged: Paged = {
            pageSize: 20,
            pageNumber: 1,
            orderColumn: "costCenter.name",
            order: "ASC",
            lstFilter: [{ object: "costCenter", column: "name", value: query, operator: "like" }]
          }
          return this.costCenterService.findByPagination(paged).pipe(
            map((data: Response<Page>) => data && data.value.content || []),
            tap({
              next: x => { },
              error: err => { this.errorCostCenter = err && err.message || 'Error en la consulta'; }
            })
          );
        }

        return of([]);
      })
    );

    if (this.object != undefined) {
      this.model.get('id')?.setValue(this.object.id);
      this.model.get('idPurchaseOrder')?.setValue(this.object.idPurchaseOrder);
      this.model.get('amount')?.setValue(this.object.amount);
      this.model.get('unitValue')?.setValue(this.object.unitValue);
      this.model.get('unitTax')?.setValue(this.object.unitTax);
      this.model.get('unitPrice')?.setValue(this.object.unitPrice);
      this.model.get('subTotal')?.setValue(this.object.amount * this.object.unitValue);

      this.model.get('product')?.get('id')?.setValue(this.pad(this.object.product.id, 3, 0));
      this.model.get('product')?.get('name')?.setValue(this.object.product.name);
      this.model.get('product')?.get('brand')?.get('id')?.setValue(this.object.product.brand.id);
      this.model.get('product')?.get('brand')?.get('name')?.setValue(this.object.product.brand.name);
      this.model.get('product')?.get('unitMeasure')?.get('id')?.setValue(this.object.product.unitMeasure.id);
      this.model.get('product')?.get('unitMeasure')?.get('name')?.setValue(this.object.product.unitMeasure.name);

      this.model.get('costCenter')?.get('id')?.setValue(this.pad(this.object.costCenter.id, 3, 0));
      this.model.get('costCenter')?.get('name')?.setValue(this.object.costCenter.name);
    }
    setTimeout(() => { this.productName.nativeElement.focus(); }, 0);
  }

  public searchCostCenter() {
    let lstFilter: Filter[] = [];
    let initialState = { lstFilter: lstFilter };

    this.bsModalRefCostCenter = this.bsModalService.show(ModalCostCenterComponent, { initialState, class: 'modal-lg modal-dialog-centered', backdrop: 'static' })
    this.bsModalRefCostCenter.content.response.subscribe((response: CostCenter) => {
      if (response != null) {
        this.model.get('costCenter')?.get('id')?.setValue(response.id);
        this.model.get('costCenter')?.get('name')?.setValue(response.name);
      }
    });
  }

  public searchProduct() {
    let lstFilter: Filter[] = [];
    let initialState = { lstFilter: lstFilter };

    this.bsModalRefItem = this.bsModalService.show(ModalProductComponent, { initialState, class: 'modal-xl-custom modal-dialog-centered', backdrop: 'static' })
    this.bsModalRefItem.content.response.subscribe((response: Product) => {
      if (response != null) {
        this.model.get('product')?.get('id')?.setValue(this.pad(response.id, 3, 0));
        this.model.get('product')?.get('name')?.setValue(response.name);
        this.model.get('product')?.get('brand')?.get('id')?.setValue(response.brand.id);
        this.model.get('product')?.get('brand')?.get('name')?.setValue(response.brand.name);
        this.model.get('product')?.get('unitMeasure')?.get('id')?.setValue(response.unitMeasure.id);
        this.model.get('product')?.get('unitMeasure')?.get('name')?.setValue(response.unitMeasure.name);
        this.amount.nativeElement.focus();
      }
    });
  }

  public cleanCostCenter() {
    this.model.get('costCenter')?.get('id')?.setValue('');
    this.model.get('costCenter')?.get('name')?.setValue('');
  }

  public cleanProduct() {
    this.model.get('product')?.get('id')?.setValue('');
    this.model.get('product')?.get('name')?.setValue('');
    this.model.get('product')?.get('brand')?.get('id')?.setValue('');
    this.model.get('product')?.get('brand')?.get('name')?.setValue('');
    this.model.get('product')?.get('unitMeasure')?.get('id')?.setValue('');
    this.model.get('product')?.get('unitMeasure')?.get('name')?.setValue('');
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

  public onKeyDownAmount(event: any) {
    if (event.keyCode === 13) {
      this.unitValue.nativeElement.focus();
    }
  }

  public onKeyDownUnitValue(event: any) {
    let amount: number = 0;
    let unitValue: number = 0;
    let subTotal: number = 0;

    amount = parseFloat(this.model.get('amount')?.value);
    unitValue = parseFloat(this.model.get('unitValue')?.value);
    subTotal = amount * unitValue;

    if (Number.isNaN(subTotal))
      subTotal = 0;

    this.model.get('subTotal')?.setValue(subTotal.toFixed(2));

    if (event.keyCode === 13) {
      this.btnConfirm.nativeElement.focus();
    }
  }

  private pad(n: any, width: number, z: any) {
    z = z || '0';
    n = n + '';

    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  public confirm(): void {
    if (this.model.valid) {
      let response: PurchaseOrderDetail = {
        id: parseInt(this.model.get('id')?.value),
        idPurchaseOrder: parseInt(this.model.get('idPurchaseOrder')?.value),
        amount: parseFloat(this.model.get('amount')?.value),
        amountEntry: parseFloat(this.model.get('amountEntry')?.value),
        amountProof: parseFloat(this.model.get('amountProof')?.value),
        unitValue: parseFloat(this.model.get('unitValue')?.value),
        unitTax: parseFloat(this.model.get('unitTax')?.value),
        unitPrice: parseFloat(this.model.get('unitPrice')?.value),
        product: {
          id: parseInt(this.model.get('product')?.get('id')?.value),
          name: this.model.get('product')?.get('name')?.value,
          alternativeCode: this.model.get('product')?.get('alternativeCode')?.value,
          brand: { id: 0, name: this.model.get('product')?.get('brand')?.get('name')?.value },
          unitMeasure: { id: 0, name: this.model.get('product')?.get('unitMeasure')?.get('name')?.value, sunatCode: '' },
          category: { id: 0, idParent: 0, name: '', path: '', isParent: 0, lstCategory: [] }
        },
        costCenter: {
          id: parseInt(this.model.get('costCenter')?.get('id')?.value),
          idDocument: 0,
          name: this.model.get('costCenter')?.get('name')?.value,
          costCenterType: {
            id: 0,
            name: '',
            active: 0
          }
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

  onSelectCostCenter(event: TypeaheadMatch<CostCenter>): void {
    let costCenter: CostCenter = event.item;
    this.model.get('costCenter')?.get('id')?.setValue(costCenter.id);
    this.model.get('costCenter')?.get('name')?.setValue(costCenter.name);
    this.amount.nativeElement.focus();
  }

  onKeyDownCostCenter(event: any) {
    if (event.keyCode === 8 || event.keyCode === 46) {
      this.model.get('costCenter')?.get('id')?.setValue('');
    }
  }

  onLoadingCostCenter(e: boolean): void {
    this.loadingCostCenter = e;
  }

  onNoResultsCostCenter(event: boolean): void {
    this.noResultCostCenter = event;
  }

  onSelectProduct(event: TypeaheadMatch<Product>): void {
    let product: Product = event.item;
    this.model.get('product')?.get('id')?.setValue(this.pad(product.id, 4, 0));
    this.model.get('product')?.get('name')?.setValue(product.name);
    this.model.get('product')?.get('brand')?.get('name')?.setValue(product.brand.name);
    this.model.get('product')?.get('unitMeasure')?.get('name')?.setValue(product.unitMeasure.name);
    this.costCenterName.nativeElement.focus();
  }

  onKeyDownProduct(event: any) {
    if (event.keyCode === 8 || event.keyCode === 46) {
      this.model.get('product')?.get('id')?.setValue('');
      this.model.get('product')?.get('brand')?.get('name')?.setValue('');
      this.model.get('product')?.get('unitMeasure')?.get('name')?.setValue('');
    }
  }

  onLoadingProduct(e: boolean): void {
    this.loadingProduct = e;
  }

  onNoResultsProduct(event: boolean): void {
    this.noResultProduct = event;
  }
}
