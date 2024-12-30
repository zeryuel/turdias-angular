import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../interfaces/product.interface';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProductService } from '../../services/product.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalMessageComponent } from '../../../../shared/components/modal-message/modal-message.component';
import { SettingProduct } from '../../interfaces/setting-product.interface';
import { CommonModule } from '@angular/common';
declare var $: any;

@Component({
  selector: 'product-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent {
  @Output() response = new EventEmitter();

  public model: FormGroup;
  public setting: SettingProduct;

  constructor(
    private bsModalService: BsModalService,
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private service: ProductService
  ) {
    this.model = this.formBuilder.group({
      id: '',
      name: ['', Validators.required],
      alternativeCode: '',
      category: this.formBuilder.group({ id: 1 }),
      brand: this.formBuilder.group({ id: ['', Validators.required] }),
      unitMeasure: this.formBuilder.group({ id: ['', Validators.required] })
    })

    this.setting = {
      recordId: 0,
      operation: '',
      onlyView: false,
      mainScreen: false,
      lstBrand: [],
      lstUnitMeasure: []
    }
  }

  ngOnInit(): void {
    $(document).ready(function () {
      let modalContent: any = $('.modal-content');
      modalContent.draggable({
        handle: '.modal-header'
      });
    });
  }

  public confirm(): void {
    if (this.model.valid) {
      let object: Product = Object.assign({}, this.model.value)

      object.id = object.id.toString() == '' ? 0 : object.id;
      object.name = object.name.toUpperCase();
      object.alternativeCode = object.alternativeCode.toUpperCase();

      if (object.id == 0) {
        this.spinner.show()
        this.service.insert(object).subscribe({
          next: (response) => {
            if (response !== null && response.status == 'ok') {
              this.model.get('id')?.setValue(this.pad(response.value, 4, 0))

              let initialState: any = { tipo: 1, opcion: 1 }
              this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
              this.bsModalRef.content.response.subscribe(() => { this.exit(true) })
              this.spinner.hide()
            } else
              this.errorHandler(response.message);
          },
          error: (err) => { this.exceptionHandler(err) }
        })
      } else {
        this.spinner.show()
        this.service.update(object).subscribe({
          next: (response) => {
            if (response !== null && response.status == 'ok') {
              let initialState: any = { tipo: 1, opcion: 2 }
              this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
              this.bsModalRef.content.response.subscribe(() => { this.exit(true) })
              this.spinner.hide()
            } else
              this.errorHandler(response.message);
          },
          error: (err) => { this.exceptionHandler(err) }
        })
      }

      this.response.emit("true");
      this.bsModalRef.hide();

    } else {
      this.model.markAllAsTouched()
      let initialState = { tipo: 3, opcion: 10 }
      this.bsModalRef = this.bsModalService.show(ModalMessageComponent, { initialState, backdrop: 'static', class: 'modal-dialog-custom' })
    }
  }

  public cancel(): void {
    this.response.emit(null);
    this.bsModalRef.hide();
  }

  public exit(updatedRecord?: boolean) {
    this.model.reset({
      id: '',
      name: '',
      alternativeCode: '',
      category: { id: 1 },
      brand: { id: '' },
      unitMeasure: { id: '' }
    });

    // this.setting.mainScreen = false;

    if (updatedRecord) {
      // this.setting.recordId = 0;
      // this.search();
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
