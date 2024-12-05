import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

import { InventoryService } from './services/inventory.service';
import { ModalMessageComponent } from '../../shared/components/modal-message/modal-message.component';
import { ModalCostCenterComponent } from '../shared/components/modal-cost-center/modal-cost-center.component';
import { PageNumber, Table } from '../../shared/interfaces/table.interface';
import { Paged } from '../../shared/interfaces/paged.interface';
import { Page } from '../../shared/interfaces/page.interface';
import { Filter } from '../../shared/interfaces/filter.interface';
import { CostCenter } from '../cost-center/interfaces/cost-center.interface';
import { InventoryDetailComponent } from './components/editar-inventory/inventory-detail.component';
import { Inventory } from './interfaces/inventory.interface';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule, FormsModule],
  templateUrl: './inventory.component.html'
})
export class InventoryComponent {

  public paged: FormGroup;
  public setting: { recordId: number, filterCostCenter: string };
  public table: Table;

  constructor(
    private bsModalService: BsModalService,
    private bsModalRef: BsModalRef,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private service: InventoryService
  ) {
    this.paged = this.formBuilder.group({
      pageSize: 10,
      pageNumber: 1,
      orderColumn: 'product.name',
      order: 'ASC',
      lstFilter: this.formBuilder.array(
        [
          this.formBuilder.group({ object: 'costCenter', column: 'id', value: ['', Validators.required], operator: 'equal' }),
          this.formBuilder.group({ object: 'product', column: 'id', value: ['', [Validators.pattern(/^([0-9])*$/)]], operator: 'equal' }),
          this.formBuilder.group({ object: 'product', column: 'alternative_code', value: '', operator: 'like' }),
          this.formBuilder.group({ object: 'product', column: 'name', value: '', operator: 'like' })
        ]
      )
    })

    this.setting = { recordId: 0, filterCostCenter: '' };

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
        { name: 'CODIGO', width: '6%', style: 'text-center' },
        { name: 'PRODUCTO', width: '40%', style: 'text-left' },
        { name: 'COD. ALTERNAT.', width: '7%', style: 'text-left' },
        { name: 'MARCA', width: '10%', style: 'text-left' },
        { name: 'UND. MEDIDA', width: '8%', style: 'text-left' },
        { name: 'POSICIÓN', width: '8%', style: 'text-center' },
        { name: 'VALOR UNIT.', width: '8%', style: 'text-end' },
        { name: 'STOCK', width: '8%', style: 'text-end' }
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
            this.spinner.hide()
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

  public edit() {
    let initialState = { id: this.setting.recordId };

    this.bsModalRef = this.bsModalService.show(InventoryDetailComponent, { initialState, class: 'modal-xl-custom modal-dialog-custom', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: Inventory) => {

      if (response != null) {
        this.search();
      };
    });
  }

  public selectRecord(record: any) {
    this.setting.recordId = record.id;
  }

  public searchCostCenter() {
    let lstFilter: Filter[] =  [
      { object: 'costCenterType', column: 'id', value: '1', operator: 'in' }
    ];
    let initialState = { lstFilter : lstFilter };

    this.bsModalRef = this.bsModalService.show(ModalCostCenterComponent, { initialState, class: 'modal-lg modal-dialog-centered', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: CostCenter) => {
      if (response != null) {
        let lstFilter = this.paged.get('lstFilter') as FormArray;
        lstFilter.controls[0].get('value')?.setValue(response.id);
        this.setting.filterCostCenter = response.name;
      }
    })
  }

  public cleanCostCenter() {
    let lstFilter = this.paged.get('lstFilter') as FormArray;

    lstFilter.controls[0].get('value')?.setValue('');
    this.setting.filterCostCenter = '';
  }

  public onKeyPressAlfaNumerico(event: any) {
    let pattern = /^[a-zA-Z0-9 ]+$/
    let inputChar = String.fromCharCode(event.charCode)

    if (!pattern.test(inputChar)) {
      event.preventDefault()
    }
  }

  public onKeyPressNumeros(event: any) {
    let pattern = /^([0-9])*$/
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
