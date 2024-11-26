import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { InventoryService } from '../../services/inventory.service';
import { ModalMessageComponent } from '../../../../shared/components/modal-message/modal-message.component';
import { Inventory } from '../../interfaces/inventory.interface';
declare var $: any;

@Component({
  selector: 'app-inventory-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './inventory-detail.component.html'
})
export class InventoryDetailComponent {
  public id!: number;
  public model: FormGroup= new FormGroup({});

  @Output() response = new EventEmitter();

  constructor(
    private spinner: NgxSpinnerService,
    private bsModalService: BsModalService,
    public bsModalRef: BsModalRef,
    public bsModalRefItem: BsModalRef,
    private formBuilder: FormBuilder,
    private service: InventoryService
  ) {

    this.model = this.formBuilder.group({
      id: '0',
      stock: '0',
      unitValue: '0',
      position: '',
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


   let object: any = { id: this.id }
    this.spinner.show()
    this.service.findById(object).subscribe({
      next: (response) => {
        if (response !== null && response.status == 'ok') {
          this.model.patchValue(response.value)
          this.spinner.hide()
        } else
          this.errorHandler(response.message);
      },
      error: (err) => { this.exceptionHandler(err) }
    })
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

  public confirm(): void {
    if (this.model.valid) {

      let object: Inventory = Object.assign({}, this.model.value)

      this.spinner.show()
      this.service.update(object).subscribe({
        next: (response) => {
          if (response !== null && response.status == 'ok') {
            let initialState: any = { tipo: 1, opcion: 2 }
            this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
            this.bsModalRef.content.response.subscribe(() => { this.response.emit(true) })
            this.spinner.hide()
          } else
            this.errorHandler(response.message);
        },
        error: (err) => { this.exceptionHandler(err) }
      })
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
