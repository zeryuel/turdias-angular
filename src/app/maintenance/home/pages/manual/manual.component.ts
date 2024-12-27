import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TypeaheadMatch, TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { map, Observable, Observer, of, switchMap, tap } from 'rxjs';
import { Paged } from '../../../../shared/interfaces/paged.interface';
import { SupplierService } from '../../../../logistics/supplier/services/supplier.service';
import { Response } from '../../../../shared/interfaces/response.interface';
import { Page } from '../../../../shared/interfaces/page.interface';
import { Supplier } from '../../../../logistics/supplier/interfaces/supplier.interface';

@Component({
  selector: 'app-manual',
  standalone: true,
  imports: [CommonModule, FormsModule, TypeaheadModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #templateSupplier let-model="item" let-index="index">
      {{model.ruc}} - {{ model.reasonSocial }}
    </ng-template>

    <div [formGroup]="myForm">
      <div class="row">

        <div class="col-1">
           <label for="id">CÓDIGO</label>
           <input formControlName="id" type="text" class="form-control form-control-sm text-center bg-custom" readonly>
        </div>

        <div class="col-1">
          <label for="ruc">RUC</label>
          <input formControlName="ruc" type="text" class="form-control form-control-sm text-uppercase">
        </div>

        <div class="col-4">
          <label for="ruc">RAZON SOCIAL</label>
          <input [typeahead]="dataSupplier$"
            [typeaheadAsync]="true"
            [typeaheadMinLength]="2"
            [typeaheadItemTemplate]="templateSupplier"
            (typeaheadOnSelect)="onSelectSupplier($event)"
            (typeaheadLoading)="onLoadingSupplier($event)"
            (typeaheadNoResults)="onNoResultsSupplier($event)"
            (keydown)="onKeyDown($event)"
            typeaheadOptionField="reasonSocial"
            formControlName="reasonSocial"
            class="form-control form-control-sm text-uppercase">
          @if(errorSupplier) { <div class="alert alert-danger" role="alert" style="font-size: .7rem;">{{ errorSupplier }}</div> }
          @if(loadingSupplier) { <div class="text-primary" style="font-size: .7rem;">Cargando...</div> }
          @if(noResultSupplier) { <div class="text-danger" style="font-size: .7rem;">No se encontraron resultados</div> }

        </div>

      </div>

    </div>
  `
})
export class ManualComponent implements OnInit {
  dataSupplier$?: Observable<Supplier[]>;
  errorSupplier?: string;
  loadingSupplier?: boolean;
  noResultSupplier = false;

  myForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private service: SupplierService
  ) {

    this.myForm = this.formBuilder.group({
      id: '',
      ruc: ['', Validators.required],
      reasonSocial: ['', Validators.required]
    })
  }

  ngOnInit(): void {
    let object: Paged = {
      pageSize: 20,
      pageNumber: 1,
      orderColumn: "supplier.reason_social",
      order: "ASC",
      lstFilter: [{ object: "supplier", column: "reason_social", value: "", operator: "like" }]
    }

    this.dataSupplier$ = new Observable((observer: Observer<string | undefined>) => {
      observer.next(this.myForm.get('reasonSocial')?.value);
    }).pipe(
      switchMap((query: string) => {
        if (query) {
          object.lstFilter[0].value = query;

          return this.service.findByPagination(object).pipe(
            map((data: Response<Page>) => data && data.value.content || []),
            tap({
              next: x => { },
              error: err => { this.errorSupplier = err && err.message || 'Error en la consulta'; }
            })
          );
        }

        return of([]);
      })
    );
  }

  onSelectSupplier(event: TypeaheadMatch<Supplier>): void {
    let supplier: Supplier = event.item;
    this.myForm.get('id')?.setValue(supplier.id);
    this.myForm.get('ruc')?.setValue(supplier.ruc);
    this.myForm.get('reasonSocial')?.setValue(supplier.reasonSocial);
  }

  onKeyDown(event: any) {
    if (event.keyCode === 8 || event.keyCode === 46) {
      this.myForm.get('id')?.setValue('');
      this.myForm.get('ruc')?.setValue('');
    }
  }

  onLoadingSupplier(e: boolean): void {
    this.loadingSupplier = e;
  }

  onNoResultsSupplier(event: boolean): void {
    this.noResultSupplier = event;
  }
}
