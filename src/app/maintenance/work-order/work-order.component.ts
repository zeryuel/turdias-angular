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
import { ModalMessageComponent } from '../../shared/components/modal-message/modal-message.component';
import { ModalVehicleComponent } from '../shared/components/modal-vehicle/modal-vehicle.component';
import { WorkOrderDetailComponent } from './components/work-order-detail/work-order-detail.component';
import { WorkOrderService } from './services/work-order.service';
import { WorkOrder, WorkOrderDetail } from './interfaces/work-order.interface';
import { SettingWorkorder } from './interfaces/setting-work-order';
import { Vehicle } from '../vehicle/interfaces/vehicle.interface';
import { Filter } from '../../shared/interfaces/filter.interface';
import { ServiceRequirement } from '../service-requirement/interfaces/service-requirement.interface';
import { ModalServiceRequirementComponent } from '../shared/components/modal-service-requirement/modal-service-requirement.component';
import { ModalInventoryComponent } from '../../logistics/shared/components/modal-inventory/modal-inventory.component';
import { Inventory } from '../../logistics/inventory/interfaces/inventory.interface';

@Component({
  selector: 'app-work-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule, BsDatepickerModule, FormsModule],
  templateUrl: './work-order.component.html'
})
export class WorkOrderComponent {
  @ViewChild('filterId') filterId!: ElementRef;

  public model: FormGroup;
  public paged: FormGroup;
  public setting: SettingWorkorder;
  public table: Table;
  public table2: Table;

  constructor(
    private bsModalService: BsModalService,
    private bsModalRef: BsModalRef,
    private bsLocaleService: BsLocaleService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private service: WorkOrderService
  ) {
    this.bsLocaleService.use('es');

    this.model = this.formBuilder.group({
      id: '',
      idServiceRequirement: ['', Validators.required],
      date: [moment().format('DD/MM/YYYY'), Validators.required],
      mileage: ['', Validators.required],
      engineHours: ['', Validators.required],
      observation: '',
      workOrderType: this.formBuilder.group({ id: 2 }),
      workOrderOrigin: this.formBuilder.group({ id: 1 }),
      vehicle: this.formBuilder.group({ id: ['', Validators.required], plate: '', name: '' }),
      state: this.formBuilder.group({ id: 11, name: '', icon:'', color:'' }),
      lstWorkOrderDetail: Array<WorkOrderDetail>
    });
    this.model.get('lstWorkOrderDetail')?.setValue([]);

    this.paged = this.formBuilder.group({
      pageSize: 10,
      pageNumber: 1,
      orderColumn: 'workOrder.id',
      order: 'DESC',
      lstFilter: this.formBuilder.array(
        [
          this.formBuilder.group({ object: 'workOrder', column: 'id', value: ['', Validators.pattern(/^[a-zA-Z0-9 ]+$/)], operator: 'equal' }),
          this.formBuilder.group({ object: 'vehicle', column: 'id', value: '', operator: 'equal' }),
          this.formBuilder.group({ object: 'workOrderType', column: 'id', value: '', operator: 'equal' }),
          this.formBuilder.group({ object: 'workOrderOrigin', column: 'id', value: '', operator: 'equal' }),
          this.formBuilder.group({ object: 'workOrder', column: 'date', value: '', operator: 'rangeDate' }),
          this.formBuilder.group({ object: 'state', column: 'id', value: '', operator: 'equal' })
        ]
      )
    });

    this.setting = {
      recordId: 0,
      recordId2: 0,
      operation: '',
      onlyView: false,
      mainScreen: false,
      stateId: 0,
      filterVehicle: '',
      filterRangeDate: [],
      lstWorkOrderType: [],
      lstWorkOrderOrigin: [],
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
        { name: 'NUMERO', width: '8%', style: 'text-center' },
        { name: 'VEHICULO', width: '32%', style: 'text-left' },
        { name: 'TIPO', width: '20%', style: 'text-left' },
        { name: 'ORIGEN', width: '20%', style: 'text-left' },
        { name: 'FECHA', width: '8%', style: 'text-center' },
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
        { name: 'CODIGO', width: '5%', style: 'text-center' },
        { name: 'TRABAJO', width: '30%', style: 'text-left' },
        { name: 'DIAGNOSTICA', width: '20%', style: 'text-left' },
        { name: 'MECANICO', width: '20%', style: 'text-left' },
        { name: 'HORA INICIO', width: '10%', style: 'text-center' },
        { name: 'HORA FIN', width: '10%', style: 'text-center' }
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

  //  onRightClick(event: any) {
  //   alert('prueba')
  //   event.preventDefault() //this will disable default action of the context menu
  //   //there will be your code for the expected right click action
  //  }

  ngOnInit(): void {
    let object: Paged = Object.assign({}, this.paged.value);
    this.spinner.show();
    this.service.setting(object).subscribe({
      next: (response) => {
        if (response !== null && response.status == 'ok') {
          this.paginationMapper(response.value.page.value, this.table);
          this.setting.lstWorkOrderType = response.value.lstWorkOrderType.value;
          this.setting.lstWorkOrderOrigin = response.value.lstWorkOrderOrigin.value;
          this.setting.lstState = response.value.lstState.value;

          this.filterId.nativeElement.focus();
          this.spinner.hide();
        } else
          this.errorHandler(response.message);
      },
      error: (err) => { this.exceptionHandler(err) }
    });
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
    this.setting.operation = 'NUEVO';
    this.setting.mainScreen = true;
    this.setting.onlyView = false;
    this.tableMapper(this.model.get('lstWorkOrderDetail')?.value, this.table2);
  }

  public update() {
    this.setting.operation = 'MODIFICAR';
    this.setting.mainScreen = true;

    let object: any = { id: this.setting.recordId };

    this.spinner.show();
    this.service.findById(object).subscribe({
      next: (response) => {
        if (response !== null && response.status == 'ok') {
          this.model.patchValue(response.value);
          this.model.get('id')?.setValue(this.pad(this.model.get('id')?.value, 5, 0));
          this.model.get('idServiceRequirement')?.setValue(this.pad(this.model.get('idServiceRequirement')?.value, 5, 0));
          this.tableMapper(this.model.get('lstWorkOrderDetail')?.value, this.table2);
          this.spinner.hide();
        } else
          this.errorHandler(response.message);
      },
      error: (err) => { this.exceptionHandler(err) }
    })
  }

  public delete() {
    let initialState = { tipo: 3, opcion: 1 };
    this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
    this.bsModalRef.content.response.subscribe((value: any) => {
      if (value === 'ok') {
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

  public close() {
    let initialState = { tipo: 3, opcion: 4 }
    this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
    this.bsModalRef.content.response.subscribe((value: any) => {

      if (value === 'ok') {
        let objeto: any = { id: this.setting.recordId }

        this.spinner.show()
        this.service.close(objeto).subscribe({
          next: (response) => {
            if (response !== null && response.status == 'ok') {
              this.setting.recordId = 0;

              setTimeout(() => {
                initialState = { tipo: 4, opcion: 1 }
                this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
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

  public save() {
    if (this.model.valid) {
      let object: WorkOrder = Object.assign({}, this.model.value);
      object.id = object.id.toString() == '' ? 0 : object.id;
      object.observation = object.observation.toUpperCase();

      let date: any = object.date;
      if (date instanceof Date) object.date = moment(object.date).format('DD/MM/YYYY');

      let array: Array<WorkOrderDetail> = this.model.get('lstWorkOrderDetail')?.value;
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
        })
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
      let initialState = { tipo: 3, opcion: 10 };
      this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' });
    }
  }

  public exit(updatedRecord?: boolean) {
    this.model.reset({
      id: '',
      idServiceRequirement: '',
      date: moment().format('DD/MM/YYYY'),
      mileage: '',
      engineHours: '',
      observation: '',
      workOrderType: { id: 2 },
      workOrderOrigin: { id: 1 },
      vehicle: {
        id: '',
        plate: '',
        name: ''
      },
      state: { id: 11, name: '', icon:'', color:'' }
    });
    this.model.get('lstWorkOrderDetail')?.setValue([]);

    this.setting.mainScreen = false;
    this.setting.recordId2 = 0;

    if (updatedRecord) {
      this.setting.recordId = 0;
      this.search();
    }
  }

  public searchServiceRequirement() {
    let lstFilter: Filter[] =  [
      // { object: 'state', column: 'id', value: '11', operator: 'in' },
      // { object: 'purchaseOrderDetail', column: 'amount_proof', value: '0', operator: 'greaterThan' }
    ];
    let initialState = { lstFilter : lstFilter };

    this.bsModalRef = this.bsModalService.show(ModalServiceRequirementComponent, { initialState, class: 'modal-lg modal-dialog-centered', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: ServiceRequirement) => {
      if (response != null) {
        this.model.get('idServiceRequirement')?.setValue(this.pad(response.id, 5, 0));
      }
    })
  }

  public searchVehicle() {
    this.bsModalRef = this.bsModalService.show(ModalVehicleComponent, { class: 'modal-lg modal-dialog-centered', backdrop: 'static' });
    this.bsModalRef.content.response.subscribe((response: Vehicle) => {
      if (response != null) {
        let lstFilter = this.paged.get('lstFilter') as FormArray;

        lstFilter.controls[1].get('value')?.setValue(response.id);
        this.setting.filterVehicle = response.plate + ' - ' + response.name;
        this.search();
      }
    });
  }

  public searchVehicleReg() {
    this.bsModalRef = this.bsModalService.show(ModalVehicleComponent, { class: 'modal-lg modal-dialog-centered', backdrop: 'static' });
    this.bsModalRef.content.response.subscribe((response: Vehicle) => {
      if (response != null) {
        this.model.get('vehicle')?.get('id')?.setValue(response.id);
        this.model.get('vehicle')?.get('plate')?.setValue(response.plate);
        this.model.get('vehicle')?.get('name')?.setValue(response.name);
      }
    });
  }

  public searchInventory() {
    let lstFilter: Filter[] =  [
      { object: 'costCenter', column: 'id', value: '1', operator: 'equal' }
    ];
    let initialState = { lstFilter : lstFilter };

    this.bsModalRef = this.bsModalService.show(ModalInventoryComponent, { initialState, class: 'modal-lg modal-dialog-centered', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: Inventory) => {
      if (response != null) {
      }
    })
  }

  public cleanServiceRequirement() {
    this.model.get('idServiceRequirement')?.setValue('');
  }

  public cleanVehicle() {
    let lstFilter = this.paged.get('lstFilter') as FormArray;

    lstFilter.controls[1].get('value')?.setValue('');
    this.setting.filterVehicle = '';
    this.search();
  }

  public cleanVehicleReg() {
    this.model.get('vehicle')?.get('id')?.setValue('');
    this.model.get('vehicle')?.get('plate')?.setValue('');
    this.model.get('vehicle')?.get('name')?.setValue('');
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
    let array: Array<WorkOrderDetail> = this.model.get('lstWorkOrderDetail')?.value;
    let object: WorkOrderDetail = undefined!;
    let exist: WorkOrderDetail;

    let initialState = { object };
    this.bsModalRef = this.bsModalService.show(WorkOrderDetailComponent, { initialState, class: 'modal-xl-custom modal-dialog-custom', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: WorkOrderDetail) => {
      if (response != null) {
        exist = array.find(x => x.work.id == response.work.id)!;

        if (exist == undefined) {
          array.push(response);
          this.tableMapper(this.model.get('lstWorkOrderDetail')?.value, this.table2);
        }
        else {
          let initialState = { tipo: 4, opcion: 6 }
          this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
        }
      }
    });
  }

  public editItem() {
    let array: Array<WorkOrderDetail> = this.model.get('lstWorkOrderDetail')?.value;
    let index: number = array.findIndex(x => x.work.id == this.setting.recordId2);
    let object: WorkOrderDetail = array[index];

    let initialState = { object };
    this.bsModalRef = this.bsModalService.show(WorkOrderDetailComponent, { initialState, class: 'modal-xl-custom modal-dialog-custom', backdrop: 'static' })
    this.bsModalRef.content.response.subscribe((response: WorkOrderDetail) => {
      if (response != null) {
        array[index].mechanic = response.mechanic;
        array[index].startTime = response.startTime;
        array[index].endTime = response.endTime;
      };
    });
  }

  public removeItem() {
    let array: Array<WorkOrderDetail> = this.model.get('lstWorkOrderDetail')?.value;
    let index: number = array.findIndex(x => x.work.id == this.setting.recordId2);
    array.splice(index, 1);
    this.tableMapper(this.model.get('lstWorkOrderDetail')?.value, this.table2);

    this.setting.recordId2 = 0;
  }

  public selectRecord(record: any) {
    this.setting.recordId = record.id;
    this.setting.stateId = record.state.id;

    if (this.setting.stateId == 11)
      this.setting.onlyView = false;
    else
      this.setting.onlyView = true;
  }

  public selectRecord2(record: any) {
    this.setting.recordId2 = record.work.id;
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

  public onKeyPressAlfaNumerico(event: any) {
    let pattern = /^[a-zA-Z0-9 ]+$/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
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

      table.startElement = 1 + (table.pageSize * (table.pageNumber - 1));
      table.endElement = page.numberOfElements + (table.pageSize * (table.pageNumber - 1));
    } else {
      table.lstPageNumber.push({ value: 'Anterior', style: 'page-item disabled' });
      table.lstPageNumber.push({ value: 'Siguiente', style: 'page-item disabled' });
    }
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
