import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

import { ModalMessageComponent } from '../../shared/components/modal-message/modal-message.component';
import { PageNumber, Table } from '../../shared/interfaces/table.interface';
import { Paged } from '../../shared/interfaces/paged.interface';
import { Page } from '../../shared/interfaces/page.interface';
import { ProductService } from './services/product.service';
import { Product } from './interfaces/product.interface';
import { SettingProduct } from './interfaces/setting-product.interface';
import { ManageBrandComponent } from './components/manage-brand/manage-brand.component';
import { ManageUnitMeasureComponent } from './components/manage-unit-measure/manage-unit-measure.component';
import { TreeNodeComponent } from "./components/tree-node/tree-node.component";
import { ProductDetailComponent } from './components/product-detail/product-detail.component';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule, TreeNodeComponent],
  templateUrl: './product.component.html'
})
export class ProductComponent {
  @ViewChild('filterName') filterName!: ElementRef;

  public paged: FormGroup;
  public setting: {recordId: number,  lstBrand: any[],  lstUnitMeasure: any[]};
  public table: Table;

  constructor(
    private bsModalService: BsModalService,
    private bsModalRef: BsModalRef,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private service: ProductService
  ) {

    this.paged = this.formBuilder.group({
      pageSize: 10,
      pageNumber: 1,
      orderColumn: 'product.id',
      order: 'ASC',
      lstFilter: this.formBuilder.array(
        [
          this.formBuilder.group({ object: 'product', column: 'id', value: '', operator: 'equal' }),
          this.formBuilder.group({ object: 'product', column: 'name', value: '', operator: 'like' }),
          this.formBuilder.group({ object: 'product', column: 'alternative_code', value: '', operator: 'like' }),
          this.formBuilder.group({ object: 'unitMeasure', column: 'id', value: '', operator: 'equal' })
        ]
      )
    })

    this.setting = {
      recordId: 0,
      lstBrand: [],
      lstUnitMeasure: []
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
        { name: 'N°', width: '5%', style: 'text-center' },
        { name: 'CODIGO', width: '7%', style: 'text-center' },
        { name: 'NOMBRE', width: '40%', style: 'text-left' },
        { name: 'SISTEMA', width: '20%', style: 'text-left' },
        { name: 'COD. ALTENATIVO', width: '10%', style: 'text-left' },
        { name: 'MARCA', width: '10%', style: 'text-left' },
        { name: 'UND. MEDIDA', width: '8%', style: 'text-left' }
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
          this.setting.lstBrand = response.value.lstBrand.value;
          this.setting.lstUnitMeasure = response.value.lstUnitMeasure.value;

          this.filterName.nativeElement.focus();
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
    this.bsModalRef = this.bsModalService.show(ProductDetailComponent, { class: 'modal-xl-custom modal-dialog-custom', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: any) => {
      if (response != null) {

      }
    });
  }

  public update() {


    let object: any = { id: this.setting.recordId };

    // this.spinner.show()
    // this.service.findById(object).subscribe({
    //   next: (response) => {
    //     if (response !== null && response.status == 'ok') {
    //       this.model.patchValue(response.value)
    //       this.model.get('id')?.setValue(this.pad(this.model.get('id')?.value, 4, 0))
    //       this.spinner.hide()
    //     } else
    //       this.errorHandler(response.message);
    //   },
    //   error: (err) => { this.exceptionHandler(err) }
    // })
  }

  public delete() {
    let initialState = { tipo: 3, opcion: 1 };
    this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
    this.bsModalRef.content.response.subscribe((value: any) => {

      if (value === 'ok') {
        let object: any = { id: this.setting.recordId }

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

  public manageBrand() {
    this.bsModalRef = this.bsModalService.show(ManageBrandComponent, { class: 'modal-lg modal-dialog-centered', backdrop: 'static' });
    this.bsModalRef.content.response.subscribe((response: any) => {
      if (response != null) {

      }
    });
  }

  public manageUnitMeasure() {
    this.bsModalRef = this.bsModalService.show(ManageUnitMeasureComponent, { class: 'modal-lg modal-dialog-centered', backdrop: 'static' });
    this.bsModalRef.content.response.subscribe((response: any) => {
      if (response != null) {

      }
    });
  }

  public selectRecord(record: any) {
    this.setting.recordId = record.id;
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

  public onKeyPressAlfaNumerico(event: any) {
    let pattern = /^[a-zA-Z0-9 ]+$/
    let inputChar = String.fromCharCode(event.charCode)

    if (!pattern.test(inputChar)) {
      event.preventDefault()
    }
  }

  private pad(n: any, width: number, z: any) {
    z = z || '0'
    n = n + ''

    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
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
