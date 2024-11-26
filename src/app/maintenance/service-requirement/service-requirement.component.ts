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
import { ServiceRequirementService } from './services/service-requirement.service';
import { SettingServiceRequirement } from './interfaces/setting-service-requirement.interface';
import { Vehicle } from '../vehicle/interfaces/vehicle.interface';
import { ModalPersonalComponent } from '../../scale/shared/components/modal-personal/modal-personal.component';
import { Personal } from '../../scale/personal/interfaces/personal.interface';
import { ServiceRequirement } from './interfaces/service-requirement.interface';

@Component({
  selector: 'app-service-requirement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule, BsDatepickerModule, FormsModule],
  templateUrl: './service-requirement.component.html'
})
export class ServiceRequirementComponent {
  @ViewChild('filterId') filterId!: ElementRef;

  public model: FormGroup;
  public paged: FormGroup;
  public setting: SettingServiceRequirement;
  public table: Table;

  constructor(
    private bsModalService: BsModalService,
    private bsModalRef: BsModalRef,
    private bsLocaleService: BsLocaleService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private service: ServiceRequirementService
  ) {
    this.bsLocaleService.use('es');

    this.model = this.formBuilder.group({
      id: '',
      idPersonal: ['', Validators.required],
      description: ['', Validators.required],
      date: [moment().format('DD/MM/YYYY'), Validators.required],
      personalDocumentNumber: '',
      personalFullName: '',
      vehicle: this.formBuilder.group({ id: ['', Validators.required], plate: '', name: '' }),
      state: this.formBuilder.group({ id: 21, name: '', icon:'', color:'' })
    });

    this.paged = this.formBuilder.group({
      pageSize: 10,
      pageNumber: 1,
      orderColumn: 'serviceRequirement.date',
      order: 'DESC',
      lstFilter: this.formBuilder.array(
        [
          this.formBuilder.group({ object: 'serviceRequirement', column: 'id', value: ['', Validators.pattern(/^[a-zA-Z0-9 ]+$/)], operator: 'equal' }),
          this.formBuilder.group({ object: 'vehicle', column: 'id', value: '', operator: 'equal' }),
          this.formBuilder.group({ object: 'personal', column: 'id', value: '', operator: 'equal' }),
          this.formBuilder.group({ object: 'serviceRequirement', column: 'date', value: '', operator: 'rangeDate' }),
          this.formBuilder.group({ object: 'state', column: 'id', value: '', operator: 'equal'})
        ]
      )
    });

    this.setting = {
      recordId: 0,
      operation: '',
      onlyView: true,
      mainScreen: false,
      stateId: 0,
      filterVehicle: '',
      filterPersonal: '',
      filterRangeDate: [],
      lstState: []
    };

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
        { name: 'NUMERO', width: '10%', style: 'text-center' },
        { name: 'VEHICULO', width: '30%', style: 'text-left' },
        { name: 'PERSONAL', width: '35%', style: 'text-left' },
        { name: 'FECHA', width: '10%', style: 'text-left' },
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
    };
  }

  ngOnInit(): void {
    let object: Paged = Object.assign({}, this.paged.value);
    this.spinner.show();
    this.service.setting(object).subscribe({
      next: (response) => {
        if (response !== null && response.status == 'ok') {
          this.paginationMapper(response.value.page.value, this.table);
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
          this.model.get('id')?.setValue(this.pad(this.model.get('id')?.value, 4, 0));
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

  public view() {
    this.update();
    this.setting.operation = 'VISUALIZAR';
    this.setting.onlyView = true;
  }

  public save() {
    if (this.model.valid) {
      let object: ServiceRequirement = Object.assign({}, this.model.value);
      object.id = object.id.toString() == '' ? 0 : object.id;

      let date: any = object.date;
      if (date instanceof Date) object.date = moment(object.date).format('DD/MM/YYYY');

      if (object.id == 0) {
        this.spinner.show();
        this.service.insert(object).subscribe({
          next: (response) => {
            if (response !== null && response.status == 'ok') {
              this.model.get('id')?.setValue(this.pad(response.value, 4, 0));

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
      id: ''
      ,idPersonal: ''
      ,description: ''
      ,date: moment().format('DD/MM/YYYY')
      ,personalDocumentNumber: ''
      ,personalFullName: ''
      ,vehicle: { id: '', plate: '', name: '' }
      ,state: { id: 21, name: '', icon:'', color:'' }
    });

    this.setting.onlyView = true;
    this.setting.mainScreen = false;

    if (updatedRecord) {
      this.setting.recordId = 0;
      this.search();
    }
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

  public searchPersonal() {
    this.bsModalRef = this.bsModalService.show(ModalPersonalComponent, { class: 'modal-lg modal-dialog-centered', backdrop: 'static'})
    this.bsModalRef.content.response.subscribe((response: Personal) => {
      if (response != null) {
        let lstFilter = this.paged.get('lstFilter') as FormArray;

        lstFilter.controls[2].get('value')?.setValue(response.id);
        this.setting.filterPersonal = response.documentNumber + ' - ' + response.fullName;
        this.search();
      }
    })
  }

  public searchPersonalReg() {
    this.bsModalRef = this.bsModalService.show(ModalPersonalComponent, { class: 'modal-lg modal-dialog-centered', backdrop: 'static'})
    this.bsModalRef.content.response.subscribe((response: Personal) => {
      if (response != null) {
        console.log(response)
        this.model.get('idPersonal')?.setValue(response.id);
        this.model.get('personalDocumentNumber')?.setValue(response.documentNumber);
        this.model.get('personalFullName')?.setValue(response.fullName);
      }
    })
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

  public cleanPersonal() {
    let lstFilter = this.paged.get('lstFilter') as FormArray;

    lstFilter.controls[2].get('value')?.setValue('');
    this.setting.filterPersonal = '';
    this.search();
  }

  public cleanPersonalReg() {
    this.model.get('idPersonal')?.setValue('');
    this.model.get('personalDocumentNumber')?.setValue('');
    this.model.get('personalFullName')?.setValue('');
  }

  public cleanRangeDate() {
    let lstFilter = this.paged.get('lstFilter') as FormArray;

    if (lstFilter.controls[3].get('value')?.value != '') {
      lstFilter.controls[3].get('value')?.setValue('');
      this.setting.filterRangeDate = [];
      this.search();
    }
  }

  public selectRecord(record: any) {
    this.setting.recordId = record.id;
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
