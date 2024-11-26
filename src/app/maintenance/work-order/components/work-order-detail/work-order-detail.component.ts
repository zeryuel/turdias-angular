import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
declare var $: any;

import { WorkOrderDetail } from '../../interfaces/work-order.interface';
import { ModalMechanicComponent } from '../../../shared/components/modal-mechanic/modal-mechanic.component';
import { ModalWorkComponent } from '../../../shared/components/modal-work/modal-work.component';
import { Mechanic } from '../../../mechanic/interfaces/mechanic.interface';
import { Work } from '../../../work/interfaces/work.interface';
import { Filter } from '../../../../shared/interfaces/filter.interface';

@Component({
  selector: 'app-work-order-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './work-order-detail.component.html'
})
export class WorkOrderDetailComponent {
  public object: WorkOrderDetail | undefined;
  public model: FormGroup;

  @Output() response = new EventEmitter();
  @ViewChild('btnConfirm', { static: false }) btnConfirm!: ElementRef;

  constructor(
    private bsModalService: BsModalService,
    public bsModalRef: BsModalRef,
    public bsModalRefMechanic: BsModalRef,
    public bsModalRefWork: BsModalRef,
    private formBuilder: FormBuilder) {

    this.model = this.formBuilder.group({
      id: '0',
      startTime: '',
      endTime: '',
      mechanic: this.formBuilder.group({ id: ['', Validators.required], fullName: '' }),
      diagnosticMechanic: this.formBuilder.group({ id: ['', Validators.required], fullName: '' }),
      work: this.formBuilder.group({ id: ['', Validators.required], name: '' })
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
      this.model.get('startTime')?.setValue(this.object.startTime);
      this.model.get('endTime')?.setValue(this.object.endTime);
      this.model.get('diagnosticMechanic')?.get('id')?.setValue(this.pad(this.object.diagnosticMechanic.id, 3, 0));
      this.model.get('diagnosticMechanic')?.get('documentNumber')?.setValue(this.object.diagnosticMechanic.documentNumber);
      this.model.get('diagnosticMechanic')?.get('fullName')?.setValue(this.object.diagnosticMechanic.fullName);
      this.model.get('mechanic')?.get('id')?.setValue(this.pad(this.object.mechanic.id, 3, 0));
      this.model.get('mechanic')?.get('documentNumber')?.setValue(this.object.mechanic.documentNumber);
      this.model.get('mechanic')?.get('fullName')?.setValue(this.object.mechanic.fullName);
      this.model.get('work')?.get('id')?.setValue(this.pad(this.object.work.id, 3, 0));
      this.model.get('work')?.get('name')?.setValue(this.object.work.name);
    }
  }

  public searchDiagnosticMechanic() {
    this.bsModalRefMechanic = this.bsModalService.show(ModalMechanicComponent, { class: 'modal-lg modal-dialog-centered', backdrop: 'static' });
    this.bsModalRefMechanic.content.response.subscribe((result: Mechanic) => {
      if (result != null) {
        this.model.get('diagnosticMechanic')?.get('id')?.setValue(this.pad(result.id, 3, 0));
        this.model.get('diagnosticMechanic')?.get('documentNumber')?.setValue(this.pad(result.id, 3, 0));
        this.model.get('diagnosticMechanic')?.get('fullName')?.setValue(result.fullName);
      }
    });
  }

  public searchMechanic() {
    this.bsModalRefMechanic = this.bsModalService.show(ModalMechanicComponent, { class: 'modal-lg modal-dialog-centered', backdrop: 'static' });
    this.bsModalRefMechanic.content.response.subscribe((result: Mechanic) => {
      if (result != null) {
        this.model.get('mechanic')?.get('id')?.setValue(this.pad(result.id, 3, 0));
        this.model.get('mechanic')?.get('documentNumber')?.setValue(this.pad(result.id, 3, 0));
        this.model.get('mechanic')?.get('fullName')?.setValue(result.fullName);
      }
    });
  }

  public cleanDiagnosticMechanic() {
    this.model.get('diagnosticMechanic')?.get('id')?.setValue('');
    this.model.get('diagnosticMechanic')?.get('documentNumber')?.setValue('');
    this.model.get('diagnosticMechanic')?.get('fullName')?.setValue('');
  }

  public cleanMechanic() {
    this.model.get('mechanic')?.get('id')?.setValue('');
    this.model.get('mechanic')?.get('documentNumber')?.setValue('');
    this.model.get('mechanic')?.get('fullName')?.setValue('');
  }

  public searchWork() {
    let lstFilter: Filter[] =  [
      { object: 'itemType', column: 'id', value: '2', operator: 'equal' }
    ];
    let initialState = { lstFilter : lstFilter };

    this.bsModalRefWork = this.bsModalService.show(ModalWorkComponent, { initialState, class: 'modal-lg modal-dialog-centered', backdrop: 'static' });
    this.bsModalRefWork.content.response.subscribe((result: Work) => {
      if (result != null) {
        this.model.get('work')?.get('id')?.setValue(this.pad(result.id, 3, 0));
        this.model.get('work')?.get('name')?.setValue(result.name);
      }
    });
  }

  public cleanWork() {
    this.model.get('work')?.get('id')?.setValue('');
    this.model.get('work')?.get('name')?.setValue('');
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
      let response: WorkOrderDetail = Object.assign({}, this.model.value);
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
